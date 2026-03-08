const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Embedded Schema for User's specific languages
const UserLanguageSchema = new Schema({
    language_code: {
        type: String,
        required: true
    },
    overall_level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: 'A1'
    },
    skills: {
        reading: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'A1' },
        writing: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'A1' },
        speaking: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'A1' }
    },
    // Tests are already here (Correct)
    tests: [{
        type: Schema.Types.ObjectId,
        ref: 'Test'
    }],
    // MOVED: Chats are now specific to this language
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    corrections: [{
        type: Boolean,
        default: true
    }],
    last_active_at: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    premium_expires_at: {
        type: Date,
        default: null
    },
    is_taking_test: {
        type: Boolean,
        default: false
    },
    languages: {
        type: [UserLanguageSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 3 languages']
    }

}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

function arrayLimit(val) {
    return val.length <= 3;
}

module.exports = mongoose.model('User', UserSchema);