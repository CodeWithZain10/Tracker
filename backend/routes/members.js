const express = require('express');
const Member = require('../models/Member');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Get all members
// @route   GET /members
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    const members = await Member.find({}).populate('user', 'name email role');
    res.json(members);
});

// @desc    Register a new member
// @route   POST /members
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, email, password, assignedPlatforms } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'member'
    });

    if (user) {
        const member = await Member.create({
            user: user._id,
            assignedPlatforms,
            stats: {
                facebook: { reach: 0, followers: 0, engagement: 0 },
                linkedin: { reach: 0, followers: 0, engagement: 0 }
            }
        });

        res.status(201).json({
            _id: member._id,
            user: user._id,
            name: user.name,
            email: user.email,
            assignedPlatforms: member.assignedPlatforms
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Delete member
// @route   DELETE /members/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        await User.findByIdAndDelete(member.user);
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member removed' });
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

// @desc    Update member stats
// @route   PUT /members/:id/stats
// @access  Private/Admin
router.put('/:id/stats', protect, admin, async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        member.stats = req.body.stats || member.stats;
        const updatedMember = await member.save();
        res.json(updatedMember);
    } else {
        res.status(404).json({ message: 'Member not found' });
    }
});

module.exports = router;
