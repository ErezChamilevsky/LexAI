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
    tests: [{
        type: Schema.Types.ObjectId,
        ref: 'Test'
    }],
    corrections: [{
        type: Boolean,
        default: true
    }]
}, { _id: true }); // Optional: set to true if you need to reference specific user-lang entries

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
    is_premium: {
        type: Boolean,
        default: false
    },
    // Custom validator for max 3 languages
    languages: {
        type: [UserLanguageSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 3 languages']
    },
    // References Chat documents
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Validator function
function arrayLimit(val) {
    return val.length <= 3;
}

module.exports = mongoose.model('User', UserSchema);