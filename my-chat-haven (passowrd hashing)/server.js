const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

// Use routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running');
});
