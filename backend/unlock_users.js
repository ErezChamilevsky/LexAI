const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env.local') });
const User = require('./models/user.model');

async function unlock() {
    try {
        const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/language_app';
        await mongoose.connect(connectionString);
        console.log("Connected to MongoDB");

        const result = await User.updateMany({}, { is_taking_test: false });
        console.log(`Unlocked ${result.modifiedCount} users.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Unlock Error:", error);
    }
}

unlock();
