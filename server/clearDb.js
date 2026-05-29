import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const clearDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = mongoose.connection.collections;
    
    // Loop over the collections and drop them
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      console.log(`Cleared ${collection.name}`);
    }
    
    console.log('Database successfully cleared!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDb();
