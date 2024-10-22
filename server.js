const express = require('express');
require('dotenv').config();
const connectToDatabase = require('./db.js');
const authRoutes = require('./routes/auth.js');
const jobRoutes = require('./routes/jobs.js');
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Middleware to parse JSON request bodies

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Connect to the MongoDB database
connectToDatabase();

// Define the routes for the API
// (you'll add these later as you implement the functionality)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});