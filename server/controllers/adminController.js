import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import List from '../models/List.js';

// ==========================================
// USER MANAGEMENT
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Admins cannot update Superadmins
    if (req.user.type === 'Admin' && user.type === 'Superadmin') {
      res.status(403);
      throw new Error('Admins cannot update Superadmins');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.type && req.user.type === 'Superadmin') {
      user.type = req.body.type;
    }
    if (req.body.role) {
      user.role = req.body.role;
    }
    if (req.body.status) {
      user.status = req.body.status;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      type: updatedUser.type,
      role: updatedUser.role,
      status: updatedUser.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (req.user.type === 'Admin' && (user.type === 'Admin' || user.type === 'Superadmin')) {
      res.status(403);
      throw new Error('Admins cannot delete other Admins or Superadmins');
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// PROJECT MANAGEMENT
// ==========================================

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({})
      .populate('owner', 'name email avatarUrl')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/admin/projects/:id
// @access  Private/Admin
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description !== undefined ? req.body.description : project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (cascades)
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Find tasks to delete their comments
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map(t => t._id);

    // Delete comments belonging to these tasks
    await Comment.deleteMany({ task: { $in: taskIds } });

    // Delete Tasks
    await Task.deleteMany({ project: project._id });

    // Delete Lists
    await List.deleteMany({ project: project._id });

    // Delete Project
    await Project.deleteOne({ _id: project._id });

    res.json({ message: 'Project and all related lists, tasks, and comments removed successfully' });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// TASK MANAGEMENT
// ==========================================

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private/Admin
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({})
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update any task
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { title, description, priority, assignee, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any task
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Delete associated comments
    await Comment.deleteMany({ task: task._id });

    // Delete the task
    await Task.deleteOne({ _id: task._id });

    // Note: To be perfectly safe, we could reorder the remaining tasks in the list,
    // but an admin deletion is a brute-force removal. We can keep it simple.
    res.json({ message: 'Task and related comments removed successfully' });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// COMMENT MANAGEMENT
// ==========================================

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({})
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment removed successfully' });
  } catch (error) {
    next(error);
  }
};
