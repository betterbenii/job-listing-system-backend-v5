const express = require('express');
require('dotenv').config();
const connectToDatabase = require('./db.js');
const authRoutes = require('./routes/auth.js');
const jobRoutes = require('./routes/jobs.js');
const userRoutes= require('./routes/users.js')
const adminRoutes= require('./routes/admin.js');
const notificationRoutes= require('./routes/notifications.js');
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes); //authentication routes
app.use('/api/jobs', jobRoutes);  //job routes 
app.use('/api/users', userRoutes);  // User routes 
app.use('/api/admin',adminRoutes); //admin routes
app.use('/api/notifications', notificationRoutes); //notification route

// Define the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Connect to the MongoDB database
connectToDatabase();



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});