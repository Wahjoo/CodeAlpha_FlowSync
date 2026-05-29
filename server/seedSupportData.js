import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import SupportArticle from './models/SupportArticle.js';
import SupportCategory from './models/SupportCategory.js';

dotenv.config();

const articles = [
  {
    title: 'How to automate your project timeline with FlowSync',
    readTime: '5 min read',
    lastUpdated: 'Last updated 2 days ago',
    icon: 'fa-regular fa-file-lines'
  },
  {
    title: 'Configuring custom API webhooks for developers',
    readTime: '12 min read',
    lastUpdated: 'Last updated 1 week ago',
    icon: 'fa-regular fa-file-lines'
  },
  {
    title: 'Understanding the difference between Workspace and Project roles',
    readTime: '8 min read',
    lastUpdated: 'Last updated 3 days ago',
    icon: 'fa-regular fa-file-lines'
  },
  {
    title: 'Troubleshooting real-time notification delays',
    readTime: '4 min read',
    lastUpdated: 'Last updated 1 month ago',
    icon: 'fa-regular fa-file-lines'
  }
];

const categories = [
  {
    title: 'Getting Started',
    description: 'Master the basics of FlowSync. From setting up your first workspace to inviting your team, find everything you need to hit the ground running.',
    icon: 'fa-solid fa-rocket',
    isFeatured: true,
    links: [
      { title: 'Workspace Setup', url: '#' },
      { title: 'User Roles', url: '#' },
      { title: 'Quick Start Guide', url: '#' },
      { title: 'Importing Data', url: '#' }
    ]
  },
  {
    title: 'Billing & Plans',
    description: 'Manage subscriptions, invoices, and payment methods.',
    icon: 'fa-solid fa-money-bill',
    isFeatured: false,
    links: []
  },
  {
    title: 'Security & Privacy',
    description: 'Learn about data encryption and SSO integration.',
    icon: 'fa-solid fa-shield-halved',
    isFeatured: false,
    links: []
  }
];

const importData = async () => {
  await connectDB();

  try {
    await SupportArticle.deleteMany();
    await SupportCategory.deleteMany();

    await SupportArticle.insertMany(articles);
    await SupportCategory.insertMany(categories);

    console.log('Support Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
