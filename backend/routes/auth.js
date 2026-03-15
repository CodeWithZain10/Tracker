const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';
    console.log(`Login attempt for: ${email}`);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Login failed: User ${email} not found`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            console.log(`Login successful: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            console.log(`Login failed: Incorrect password for ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`Login error for ${email}:`, error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
