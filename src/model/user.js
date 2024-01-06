const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: { type: String },
    last_name: { type: String },
    mobile: { type: Number },
    email: { type: String },
    password: { type: String },
    address: { type: String },
    friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'friend-request' }],
    friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'friend-request' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
})

module.exports = mongoose.model('user', userSchema)