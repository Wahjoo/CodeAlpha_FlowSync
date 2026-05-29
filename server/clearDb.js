import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const clearDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Drop the entire database to clear all data
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped and successfully cleared!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDb();
