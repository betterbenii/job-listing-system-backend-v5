const express = require('express');
const connectToDatabase = require('./db');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Connect to the MongoDB database
connectToDatabase();

// Define the routes for the API
// (you'll add these later as you implement the functionality)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});