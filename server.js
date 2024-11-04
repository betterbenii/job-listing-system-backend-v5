const express = require('express');
require('dotenv').config();
const connectToDatabase = require('./db.js');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth.js');
const jobRoutes = require('./routes/jobs.js');
const userRoutes = require('./routes/users.js');
const adminRoutes = require('./routes/admin.js');
const notificationRoutes = require('./routes/notifications.js');

const app = express();
app.use(cors()); // Allow all origins
app.use(express.json());

app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/jobs', jobRoutes); // Job routes 
app.use('/api/users', userRoutes); // User routes 
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/notifications', notificationRoutes); // Notification route

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Connect to the MongoDB database
connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
