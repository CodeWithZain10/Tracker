const express = require('express');
const router = express.Router();
const Update = require('../models/ProductUpdate');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all updates
// @route   GET /updates
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const updates = await Update.find({})
            .populate('member', 'name email')
            .sort({ isPinned: -1, createdAt: -1 });
        res.json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create an update
// @route   POST /updates
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { product, content } = req.body;
        const update = await Update.create({
            member: req.user._id,
            product,
            content
        });
        res.status(201).json(update);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Pin/Unpin an update
// @route   PATCH /updates/:id/pin
// @access  Private/Admin
router.patch('/:id/pin', protect, admin, async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);
        if (update) {
            update.isPinned = !update.isPinned;
            const updatedUpdate = await update.save();
            res.json(updatedUpdate);
        } else {
            res.status(404).json({ message: 'Update not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Mark update as resolved
// @route   PATCH /updates/:id/resolve
// @access  Private/Admin
router.patch('/:id/resolve', protect, admin, async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);
        if (update) {
            update.isResolved = true;
            const updatedUpdate = await update.save();
            res.json(updatedUpdate);
        } else {
            res.status(404).json({ message: 'Update not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete an update
// @route   DELETE /updates/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);
        if (update) {
            await update.deleteOne();
            res.json({ message: 'Update removed' });
        } else {
            res.status(404).json({ message: 'Update not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
