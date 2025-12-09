const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    language_code: { type: String, required: true },

    // What kind of test is this?
    type: {
        type: String,
        enum: ['placement', 'reading', 'writing', 'speaking'],
        required: true
    },

    date_taken: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 100 }, // Raw score

    // The CEFR level determined by this specific test
    result_level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        required: true
    },

    details: { type: Map, of: String } // Feedback or question breakdown
});

module.exports = mongoose.model('Test', TestSchema);