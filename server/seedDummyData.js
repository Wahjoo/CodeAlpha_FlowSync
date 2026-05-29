import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Task from './models/Task.js';
import Project from './models/Project.js';
import List from './models/List.js';

dotenv.config();

const teamMembers = [
  { name: "Sarah Jenkins", email: "sarah@flowsync.io", role: "Lead Designer", status: "online", type: "Admin", img: "S" },
  { name: "Marcus Chen", email: "marcus@flowsync.io", role: "Senior Developer", status: "away", type: "Member", img: "M" },
  { name: "Elena Rodriguez", email: "elena@flowsync.io", role: "Product Manager", status: "online", type: "Admin", img: "E" },
  { name: "Julian Vane", email: "julian@flowsync.io", role: "Backend Architect", status: "offline", type: "Member", img: "J" },
  { name: "Amara Okoro", email: "amara@flowsync.io", role: "UX Researcher", status: "online", type: "Member", img: "A" },
  { name: "David Kim", email: "david@flowsync.io", role: "DevOps Engineer", status: "busy", type: "Member", img: "D" },
  { name: "Sophie Muller", email: "sophie@flowsync.io", role: "QA Lead", status: "online", type: "Member", img: "S" },
  { name: "Liam O'Connor", email: "liam@flowsync.io", role: "Frontend Dev", status: "away", type: "Member", img: "L" }
];

const dummyTasks = [
  { title: "Redesign Hero Section", description: "Update the homepage hero with the new Kinetic Flow visual tokens and interactive components.", priority: "HIGH", dueDate: new Date(new Date().setDate(new Date().getDate() + 2)) },
  { title: "API Integration", description: "Connect the dashboard cards to the real-time data synchronization service.", priority: "MEDIUM", dueDate: new Date(new Date().setDate(new Date().getDate() + 4)) },
  { title: "User Testing Report", description: "Analyze the feedback from the Q3 beta testing group and document pain points.", priority: "HIGH", dueDate: new Date(new Date().setDate(new Date().getDate() - 1)) }, // Overdue
  { title: "Internal Documentation", description: "Standardize the Figma-to-HTML handoff process for the engineering team.", priority: "LOW", dueDate: new Date(new Date().setDate(new Date().getDate() + 7)) },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Seeding started...');

    // 1. Seed Users (avoid duplicates by email)
    for (const member of teamMembers) {
      const existingUser = await User.findOne({ email: member.email });
      if (!existingUser) {
        await User.create({
          name: member.name,
          email: member.email,
          password: 'password123', // default password
          role: member.role,
          status: member.status,
          type: member.type,
          avatarUrl: `https://openui.fly.dev/openui/80x80.svg?text=${member.img}`
        });
      }
    }
    console.log('Dummy team members seeded.');

    // 2. Seed Tasks for all users (so anyone who logs in sees them)
    const allUsers = await User.find({});
    
    if (allUsers.length > 0) {
      // Create a dummy project and list if none exist
      let dummyProject = await Project.findOne({ name: "Dummy Seed Project" });
      if (!dummyProject) {
        dummyProject = await Project.create({
          name: "Dummy Seed Project",
          description: "A project created by the seeder to hold dummy tasks.",
          owner: allUsers[0]._id,
          members: allUsers.map(u => ({ user: u._id, role: 'MEMBER' }))
        });
      }

      let dummyList = await List.findOne({ project: dummyProject._id });
      if (!dummyList) {
        dummyList = await List.create({
          name: "Dummy List",
          project: dummyProject._id,
          order: 0
        });
      }

      for (const user of allUsers) {
        // Check if user already has these tasks
        const userTasks = await Task.countDocuments({ assignee: user._id, project: dummyProject._id });
        if (userTasks === 0) {
          for (let i = 0; i < dummyTasks.length; i++) {
            await Task.create({
              ...dummyTasks[i],
              list: dummyList._id,
              project: dummyProject._id,
              order: i,
              assignee: user._id,
              creator: allUsers[0]._id
            });
          }
        }
      }
      console.log('Dummy tasks seeded for all users.');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
