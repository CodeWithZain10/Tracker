const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/members', memberRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        const User = require('./models/User');
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        res.json({
            status: 'up',
            database: dbStatus,
            adminUserExists: adminCount > 0,
            adminCount: adminCount,
            adminEmail: (process.env.ADMIN_EMAIL || 'admin@byteslimited.com').toLowerCase().trim()
        });
    } catch (error) {
        res.status(500).json({ status: 'down', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

// Connect to database and seed admin before starting the server
connectDB().then(async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@byteslimited.com').toLowerCase().trim();
        const adminPassword = (process.env.ADMIN_PASSWORD || 'bytes@123').trim();
        const User = require('./models/User');
        
        let admin = await User.findOne({ email: adminEmail });
        
        if (!admin) {
            console.log('No admin found, seeding default admin...');
            admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log(`Admin created successfully: ${adminEmail}`);
        } else {
            console.log(`Admin already exists. Updating password to ensure it matches environment...`);
            admin.password = adminPassword;
            await admin.save();
            console.log(`Admin password updated for: ${adminEmail}`);
        }
    } catch (seedError) {
        console.error(`Auto-seeding failed for ${adminEmail}:`, seedError.message);
    }
    
    app.listen(PORT, console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
});
