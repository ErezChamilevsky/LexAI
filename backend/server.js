require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Middleware to allow frontend to talk to backend
// --- Import Routes ---
// Ensure you create these route files in src/routes/
const chatRoutes = require('./routes/chat.routes');
const userRoutes = require('./routes/user.routes');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 12345;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

// --- Database Connection ---
const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/language_app';

mongoose.connect(connectionString)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error', err));
    

// --- Routes Mounting ---
// This prefixes all routes. Example: POST /api/users/signup
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tests', testRoutes);
app.use('/auth', authRoutes);

// --- Base Route (Health Check) ---
app.get('/', (req, res) => {
    res.send('Language Learning AI API is running...');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
module.exports = app;