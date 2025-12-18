const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Destructure Schema for cleaner code

// --- Message Schema ---
const MessageSchema = new Schema({
    // Role of the sender
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },

    // The main text content
    content: {
        type: String,
        required: true
    },

    // Timestamp of the message creation
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false // Prevents Mongoose from creating an _id for subdocuments
});

// --- Chat Schema ---
const ChatSchema = new Schema({
    // Reference to the User model
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // The language code (e.g., 'en', 'fr')
    language_code: {
        type: String,
        required: true
    },

    // Optional topic for the chat
    topic: { type: String },

    summary: {
        type: String,
    },

    // Array of message subdocuments
    messages: [MessageSchema]
}, {
    // Mongoose options
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Create a compound index for efficient querying
// This is the more flexible/readable formatting you requested:
ChatSchema.index({
    user_id: 1,
    language_code: 1
});

module.exports = mongoose.model('Chat', ChatSchema);