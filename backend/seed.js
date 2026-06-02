require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Task = require('./src/models/Task');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@todoapp.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('Admin user created');

    // Create regular users
    const userPassword = await bcrypt.hash('User@123', 10);
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'user',
      isVerified: true,
      isActive: true
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'user',
      isVerified: true,
      isActive: true
    });
    console.log('Regular users created');

    // Create sample tasks for user1
    const tasks = [
      {
        userId: user1._id,
        title: 'Complete project documentation',
        description: 'Write comprehensive README and API docs',
        priority: 'High',
        category: 'Work',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        reminderTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user1._id,
        title: 'Review pull requests',
        description: 'Review and merge pending PRs',
        priority: 'Medium',
        category: 'Work',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        userId: user1._id,
        title: 'Team meeting',
        description: 'Weekly sync with development team',
        priority: 'High',
        category: 'Work',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        userId: user1._id,
        title: 'Grocery shopping',
        description: 'Buy weekly groceries',
        priority: 'Low',
        category: 'Personal',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending'
      },
      {
        userId: user1._id,
        title: 'Gym workout',
        description: 'Morning workout session',
        priority: 'Medium',
        category: 'Health',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed'
      }
    ];

    await Task.insertMany(tasks);
    console.log('Sample tasks created');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin Login:');
    console.log('  Email: admin@todoapp.com');
    console.log('  Password: Admin@123');
    console.log('\nUser Login:');
    console.log('  Email: john@example.com');
    console.log('  Password: User@123');
    console.log('\nDatabase seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
