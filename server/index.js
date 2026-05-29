import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env variables
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  // Ensure the superadmin exists or is updated
  try {
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    if (!superadminEmail) return;
    
    const User = (await import('./models/User.js')).default;
    const user = await User.findOne({ email: superadminEmail });
    if (user && user.type !== 'Superadmin') {
      user.type = 'Superadmin';
      await user.save();
      console.log(`Elevated ${superadminEmail} to Superadmin`);
    }
  } catch (error) {
    console.error('Failed to verify superadmin status:', error);
  }
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import listRoutes from './routes/listRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

// Import Middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import socketHandler from './sockets/socketHandler.js';

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up Socket.io
const io = new Server(server, {
  cors: corsOptions,
});

// Expose io instance to express controllers
app.set('socketio', io);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Attach WebSocket room logic
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
