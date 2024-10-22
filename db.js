const mongoose = require('mongoose');
//mongodb connection string
const MONGO_URL= 'mongodb+srv://admin:YcKHsdekPleZoNrc@job-listing-cluster.vmhb8.mongodb.net/job-listing-system?retryWrites=true&w=majority&appName=job-listing-cluster'
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;