import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment on a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    if (!content) {
      res.status(400);
      throw new Error('Please add comment content');
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
      throw new Error('Not authorized to comment in this project');
    }

    const comment = await Comment.create({
      content,
      task: taskId,
      user: req.user._id,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatarUrl');

    // Notify clients viewing this task board
    const io = req.app.get('socketio');
    if (io) {
      io.to(`project:${task.project.toString()}`).emit('comment:added', {
        taskId,
        comment: populatedComment,
      });
    }

    // Determine who to notify
    const notifyUserIds = new Set();
    
    // Notify assignee
    if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
      notifyUserIds.add(task.assignee.toString());
    }
    
    // Notify task creator
    if (task.creator.toString() !== req.user._id.toString()) {
      notifyUserIds.add(task.creator.toString());
    }

    // Create notifications in db and emit via socket
    for (const userId of notifyUserIds) {
      const notification = await Notification.create({
        recipient: userId,
        title: 'New Comment',
        message: `${req.user.name} commented on "${task.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
      });

      if (io) {
        io.to(`user:${userId}`).emit('notification:new', notification);
      }
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};
