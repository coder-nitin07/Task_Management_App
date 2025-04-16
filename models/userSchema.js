const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        immutable: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [ 'Admin', 'Manager', 'User' ],
        default: 'User'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;