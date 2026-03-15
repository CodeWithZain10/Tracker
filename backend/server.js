const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@byteslimited.com';
        const User = require('./models/User');
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            console.log('No admin found, seeding default admin...');
            await User.create({
                name: 'Admin',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'bytes@123',
                role: 'admin'
            });
            console.log(`Admin created successfully: ${adminEmail}`);
        } else {
            console.log(`Admin already exists: ${adminExists.email}`);
        }
    } catch (seedError) {
        console.error('Auto-seeding failed:', seedError.message);
    }
    
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
});

