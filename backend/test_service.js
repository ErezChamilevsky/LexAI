const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env.local') });
const mongoose = require('mongoose');
const ChatService = require('./services/chat.service');
const User = require('./models/user.model');
const fs = require('fs');

const run = async () => {
    try {
        const uri = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/language_app';
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            process.exit(1);
        }

        console.log("Testing createNewChat for user:", user.email);

        // Mock payload
        const languageCode = 'es'; // Spanish
        const topic = 'Test Topic via Script';

        const chat = await ChatService.createNewChat(user._id, languageCode, topic);
        console.log("SUCCESS! Chat created:", chat);

    } catch (error) {
        console.error("FAILURE LOGGED TO result.txt");
        fs.writeFileSync('result.txt', error.stack || String(error));
    } finally {
        await mongoose.disconnect();
    }
};

run();
