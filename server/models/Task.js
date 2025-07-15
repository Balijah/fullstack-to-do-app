const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    }
});

module.exports = mongoose.model('Task', TaskSchema);