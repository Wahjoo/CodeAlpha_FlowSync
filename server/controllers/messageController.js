import Message from '../models/Message.js';

// @desc    Get conversation between current user and target user
// @route   GET /api/messages/:userId
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatarUrl')
      .populate('receiver', 'name avatarUrl');

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      res.status(400);
      throw new Error('Please provide receiver and content');
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatarUrl')
      .populate('receiver', 'name avatarUrl');

    // Emit socket event to the receiver
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user:${receiverId}`).emit('chat:receive', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};
