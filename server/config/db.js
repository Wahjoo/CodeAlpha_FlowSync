import mongoose from 'mongoose';
import User from '../models/User.js';

const seedMockUsers = async () => {
  const mockUsers = [
    { name: 'Sarah Chen', email: 'sarah@flowsync.com', password: 'password123' },
    { name: 'Marcus Wright', email: 'marcus@flowsync.com', password: 'password123' },
    { name: 'David Kim', email: 'david@flowsync.com', password: 'password123' },
    { name: 'Jane Doe', email: 'jane@flowsync.com', password: 'password123' },
    { name: 'Steve Miller', email: 'steve@flowsync.com', password: 'password123' },
    { name: 'Kevin Lee', email: 'kevin@flowsync.com', password: 'password123' },
    { name: 'Alice Rose', email: 'alice@flowsync.com', password: 'password123' },
    { name: 'Tom Brown', email: 'tom@flowsync.com', password: 'password123' }
  ];

  try {
    for (const u of mockUsers) {
      const userExists = await User.findOne({ email: u.email });
      if (!userExists) {
        await User.create(u);
        console.log(`Seeded mock user: ${u.name} (${u.email})`);
      }
    }
  } catch (error) {
    console.error(`Error seeding mock users: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed mock users to ensure FlowSync workspace collab profiles exist
    await seedMockUsers();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
