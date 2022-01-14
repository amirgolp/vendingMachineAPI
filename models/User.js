const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: false,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'buyer'],
        default: 'user'
    },
    deposit: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema)