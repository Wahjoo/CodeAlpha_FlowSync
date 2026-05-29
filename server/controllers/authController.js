import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    // Password will be automatically hashed in pre-save middleware
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Check user & return password selection explicitly for comparison
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      bio: req.user.bio,
      pushEnabled: req.user.pushEnabled,
      emailEnabled: req.user.emailEnabled,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in workspace
// @route   GET /api/auth/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile/settings
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      if (req.body.pushEnabled !== undefined) user.pushEnabled = req.body.pushEnabled;
      if (req.body.emailEnabled !== undefined) user.emailEnabled = req.body.emailEnabled;
      
      // Update password if provided
      if (req.body.password) {
        if (!req.body.currentPassword) {
          res.status(400);
          throw new Error('Please provide current password to change password');
        }
        
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          res.status(401);
          throw new Error('Incorrect current password');
        }
        
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        bio: updatedUser.bio,
        pushEnabled: updatedUser.pushEnabled,
        emailEnabled: updatedUser.emailEnabled,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin/Superadmin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      res.status(404);
      throw new Error('User not found');
    }

    const { type, role } = req.body;
    const currentUser = req.user;

    // RBAC Rules
    if (currentUser.type === 'Admin') {
      if (type && type !== 'Member') {
        res.status(403);
        throw new Error('Admins can only assign the Member type');
      }
      if (userToUpdate.type === 'Superadmin' || userToUpdate.type === 'Admin') {
        res.status(403);
        throw new Error('Admins cannot edit other Admins or Superadmins');
      }
    } else if (currentUser.type !== 'Superadmin') {
      res.status(403);
      throw new Error('Not authorized to manage roles');
    }

    if (type) userToUpdate.type = type;
    if (role !== undefined) userToUpdate.role = role;

    const updatedUser = await userToUpdate.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      type: updatedUser.type,
    });
  } catch (error) {
    next(error);
  }
};
