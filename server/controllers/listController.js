import List from '../models/List.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

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

// @desc    Create a list (column) in project
// @route   POST /api/projects/:projectId/lists
// @access  Private
export const createList = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { projectId } = req.params;

    if (!name) {
      res.status(400);
      throw new Error('Please provide list name');
    }

    // Check project member status
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    // Get order for list
    const count = await List.countDocuments({ project: projectId });

    const list = await List.create({
      name,
      project: projectId,
      order: count,
    });

    // Notify clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, projectId);

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a list (rename or re-order)
// @route   PUT /api/lists/:id
// @access  Private
export const updateList = async (req, res, next) => {
  try {
    const { name, order } = req.body;
    const list = await List.findById(req.params.id);

    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }

    // Check project membership
    const project = await Project.findById(list.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    if (name !== undefined) list.name = name;
    if (order !== undefined) list.order = order;

    await list.save();

    // Notify clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, list.project.toString());

    res.json(list);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a list & its tasks
// @route   DELETE /api/lists/:id
// @access  Private
export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      res.status(404);
      throw new Error('List not found');
    }

    // Check project membership
    const project = await Project.findById(list.project);
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to edit this project');
    }

    const projectId = list.project.toString();

    // Delete all tasks in the list
    await Task.deleteMany({ list: list._id });
    
    // Delete list itself
    await List.deleteOne({ _id: list._id });

    // Reorder remaining lists
    const remainingLists = await List.find({ project: projectId }).sort({ order: 1 });
    for (let i = 0; i < remainingLists.length; i++) {
      remainingLists[i].order = i;
      await remainingLists[i].save();
    }

    // Notify clients
    const io = req.app.get('socketio');
    await emitProjectUpdate(io, projectId);

    res.json({ message: 'List and associated tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};
