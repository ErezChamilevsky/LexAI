const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LanguageSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true // e.g., "en", "es"
    },
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false } // Only created_at requested
});

module.exports = mongoose.model('Language', LanguageSchema);