const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Member'
    },
    platform: {
        type: String,
        required: true,
        enum: ['Facebook', 'LinkedIn', 'General'],
        default: 'General'
    },
    priority: {
        type: String,
        required: true,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    dueDate: {
        type: Date,
        required: true
    },
    targetNumber: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        default: 'clients'
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['To Do', 'In Progress', 'Review', 'Done'],
        default: 'To Do'
    },
    progress: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
