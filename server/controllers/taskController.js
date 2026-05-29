import Task from '../models/Task.js';
import List from '../models/List.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

// Helper to emit project update socket event
const emitProjectUpdate = async (io, projectId) => {
  if (!io) return;
  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatarUrl')
    .populate('members.user', 'name email avatarUrl');
  const lists = await List.find({ project: projectId }).sort({ order: 1 });
  const tasks = await Task.find({ project: projectId })
    .populate('assignee', 'name email avatarUrl')
    .populate('creator', 'name email avatarUrl')
    .sort({ order: 1 });

  io.to(`project:${projectId}`).emit('project:updated', { project, lists, tasks });
};

// @desc    Create a task
// @route   POST /api/lists/:listId/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, assignee, dueDate } = req.body;
    const { listId } = req.params;

    if (!title) {
      res.status(400);
      throw new Error('Please add a task title');
    }

    const list = await List.findById(listId);
    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }

    const projectId = list.project.toString();
    const project = await Project.findById(projectId);

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    // Get count for order
    const count = await Task.countDocuments({ list: listId });

    const task = await Task.create({
      title,
      description: description || '',
      list: listId,
      project: projectId,
      order: count,
      priority: priority || 'MEDIUM',
      assignee: assignee || null,
      creator: req.user._id,
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatarUrl')
      .populate('creator', 'name email avatarUrl');

    // Notify clients of board update
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, projectId);

    // If assigned to someone else, create a notification
    if (assignee && assignee.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: assignee,
        title: 'Task Assigned',
        message: `${req.user.name} assigned you the task: "${title}" in project "${project.name}"`
      });

      if (io) {
        io.to(`user:${assignee}`).emit('notification:new', notification);
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details (title, description, assignee, priority, due date)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, assignee, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    const oldAssignee = task.assignee ? task.assignee.toString() : null;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatarUrl')
      .populate('creator', 'name email avatarUrl');

    // Notify board clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, task.project.toString());

    // Notify new assignee if changed
    const newAssignee = assignee ? assignee.toString() : null;
    if (newAssignee && newAssignee !== req.user._id.toString() && newAssignee !== oldAssignee) {
      const notification = await Notification.create({
        recipient: newAssignee,
        title: 'Task Assigned',
        message: `${req.user.name} assigned you the task: "${task.title}" in project "${project.name}"`
      });

      if (io) {
        io.to(`user:${newAssignee}`).emit('notification:new', notification);
      }
    }

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Move a task within a list or between lists
// @route   PUT /api/tasks/:id/move
// @access  Private
export const moveTask = async (req, res, next) => {
  try {
    const { listId, order } = req.body; // target listId and new index order
    const taskId = req.params.id;

    if (!listId || order === undefined) {
      res.status(400);
      throw new Error('Please provide destination listId and order');
    }

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    const sourceListId = task.list.toString();
    const sourceOrder = task.order;
    const destListId = listId.toString();
    const destOrder = order;

    if (sourceListId === destListId) {
      // Reordering within the same list
      if (sourceOrder === destOrder) {
        return res.json(task);
      }

      const tasksInList = await Task.find({ list: sourceListId });

      for (let t of tasksInList) {
        if (sourceOrder < destOrder) {
          // Task moving down
          if (t.order > sourceOrder && t.order <= destOrder) {
            t.order = t.order - 1;
            await t.save();
          }
        } else {
          // Task moving up
          if (t.order >= destOrder && t.order < sourceOrder) {
            t.order = t.order + 1;
            await t.save();
          }
        }
      }

      task.order = destOrder;
      await task.save();
    } else {
      // Moving between lists
      // 1. Shift down remaining tasks in source list
      const tasksInSource = await Task.find({ list: sourceListId });
      for (let t of tasksInSource) {
        if (t.order > sourceOrder) {
          t.order = t.order - 1;
          await t.save();
        }
      }

      // 2. Shift up tasks in destination list to make room
      const tasksInDest = await Task.find({ list: destListId });
      for (let t of tasksInDest) {
        if (t.order >= destOrder) {
          t.order = t.order + 1;
          await t.save();
        }
      }

      // 3. Move task
      task.list = destListId;
      task.order = destOrder;
      await task.save();
    }

    // Notify clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, task.project.toString());

    res.json({ message: 'Task moved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    const listId = task.list.toString();
    const taskOrder = task.order;
    const projectId = task.project.toString();

    // Delete the task
    await Task.deleteOne({ _id: task._id });

    // Reorder subsequent tasks in the same list
    const remainingTasks = await Task.find({ list: listId }).sort({ order: 1 });
    for (let i = 0; i < remainingTasks.length; i++) {
      remainingTasks[i].order = i;
      await remainingTasks[i].save();
    }

    // Notify clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, projectId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks assigned to the current user
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name')
      .populate('creator', 'name avatarUrl')
      .populate('assignee', 'name avatarUrl')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for all projects in the database
// @route   GET /api/tasks/all
// @access  Private
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({})
      .populate('project', 'name')
      .populate('creator', 'name avatarUrl')
      .populate('assignee', 'name avatarUrl')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get workspace analytics (dynamic mock data)
// @route   GET /api/tasks/analytics/workspace
// @access  Private
export const getWorkspaceAnalytics = async (req, res, next) => {
  try {
    // 1. Get all lists that might be considered "Done"
    const doneLists = await List.find({ name: { $regex: /done|completed|finished/i } });
    const doneListIds = doneLists.map(l => l._id);

    // 2. Count completed tasks today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const completedToday = await Task.countDocuments({
      list: { $in: doneListIds },
      updatedAt: { $gte: startOfToday }
    });

    // 3. Count total completed tasks to generate a realistic mock for Focus Hours
    const totalCompletedTasks = await Task.countDocuments({ list: { $in: doneListIds } });

    // Assuming average 1.5 hours per task
    const focusHours = (totalCompletedTasks * 1.5).toFixed(1);

    // 4. Generate a mock team velocity based on active tasks
    const activeTasks = await Task.countDocuments({ list: { $nin: doneListIds } });
    const teamVelocity = activeTasks > 0 ? `+${Math.min(100, Math.round((completedToday / activeTasks) * 100))}%` : '+0%';

    // 5. Mock efficiency report values
    const efficiencyReport = {
      avgResponse: '12 mins',
      approvalRate: '98.2%'
    };

    res.json({
      completedToday,
      focusHours,
      teamVelocity,
      efficiencyReport
    });
  } catch (error) {
    next(error);
  }
};
