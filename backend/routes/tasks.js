const express = require('express');
const Task = require('../models/Task');
const Member = require('../models/Member');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Get all tasks or member specific tasks
// @route   GET /tasks
// @access  Private
router.get('/', protect, async (req, res) => {
    let tasks;
    
    // Auto-update overdue tasks
    const now = new Date();
    await Task.updateMany(
        { 
            status: { $ne: 'Done' }, 
            dueDate: { $lt: now } 
        },
        { $set: { status: 'Overdue' } }
    );

    const { member, status, priority } = req.query;
    const query = {};

    if (req.user.role === 'admin') {
        if (member) query.assignedTo = member;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        tasks = await Task.find(query).populate({
            path: 'assignedTo',
            populate: { path: 'user', select: 'name' }
        }).sort({ dueDate: 1 });
    } else {
        const memberDoc = await Member.findOne({ user: req.user._id });
        query.assignedTo = memberDoc._id;
        if (status) query.status = status;
        if (priority) query.priority = priority;

        tasks = await Task.find(query).sort({ dueDate: 1 });
    }
    res.json(tasks);
});

// @desc    Create a task
// @route   POST /tasks
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { title, assignedTo, platform, dueDate, targetNumber, unit, notes, priority } = req.body;

    const task = await Task.create({
        title,
        assignedTo,
        platform,
        dueDate,
        targetNumber,
        unit,
        notes,
        priority: priority || 'Medium',
        status: 'To Do',
        progress: 0
    });

    res.status(201).json(task);
});

// @desc    Update task status/progress
// @route   PUT /tasks/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        if (req.user.role === 'member') {
            // Member can only update progress and status
            task.progress = req.body.progress !== undefined ? req.body.progress : task.progress;
            task.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : task.isCompleted;
            
            if (task.isCompleted) {
                task.status = 'Done';
                task.progress = task.targetNumber;
            } else if (task.progress > 0) {
                task.status = 'In Progress';
            }
        } else {
            // Admin can update everything
            task.title = req.body.title || task.title;
            task.platform = req.body.platform || task.platform;
            task.dueDate = req.body.dueDate || task.dueDate;
            task.targetNumber = req.body.targetNumber || task.targetNumber;
            task.status = req.body.status || task.status;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

// @desc    Delete task
// @route   DELETE /tasks/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (task) {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task removed' });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});

module.exports = router;
