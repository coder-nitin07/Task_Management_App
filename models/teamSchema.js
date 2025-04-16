const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    currentSize: {
        type: Number,
        max: 4,
        default: 0
    },
    archived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;