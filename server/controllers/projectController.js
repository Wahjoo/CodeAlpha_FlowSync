import Project from '../models/Project.js';
import List from '../models/List.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please add a project name');
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'OWNER'
        }
      ]
    });

    // Automatically create default lists: To Do, In Progress, Done
    const defaultLists = ['To Do', 'In Progress', 'Done'];
    const listPromises = defaultLists.map((listName, index) => {
      return List.create({
        name: listName,
        project: project._id,
        order: index
      });
    });
    
    await Promise.all(listPromises);

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl');

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Get project details with lists & tasks
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatarUrl')
      .populate('members.user', 'name email avatarUrl');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is a member of the project
    const isMember = project.members.some(
      (member) => member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this project');
    }

    // Fetch lists
    const lists = await List.find({ project: project._id }).sort({ order: 1 });

    // Fetch tasks
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatarUrl')
      .populate('creator', 'name email avatarUrl')
      .sort({ order: 1 });

    res.json({
      project,
      lists,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
export const addProjectMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please provide user email to invite');
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if the current user is authorized to invite (Owner or Admin)
    const currentMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      res.status(403);
      throw new Error('Not authorized to add members (only Owners/Admins)');
    }

    // Find the user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404);
      throw new Error('User with this email not found');
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      res.status(400);
      throw new Error('User is already a project member');
    }

    // Add user to project
    project.members.push({ user: userToAdd._id, role: 'MEMBER' });
    await project.save();

    // Create a persistent notification for the user
    const notification = await Notification.create({
      recipient: userToAdd._id,
      title: 'Added to Project',
      message: `${req.user.name} added you to the project "${project.name}"`
    });

    // Notify the user in real-time via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      // Send notification event to the specific user room
      io.to(`user:${userToAdd._id.toString()}`).emit('notification:new', notification);
      
      // Update all members currently viewing the board that members list has changed
      const populatedProject = await Project.findById(project._id)
        .populate('owner', 'name email avatarUrl')
        .populate('members.user', 'name email avatarUrl');

      io.to(`project:${project._id.toString()}`).emit('project:updated', {
        project: populatedProject
      });
    }

    res.json({ message: 'Member added successfully', user: userToAdd });
  } catch (error) {
    next(error);
  }
};
