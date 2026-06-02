require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearDatabase();
