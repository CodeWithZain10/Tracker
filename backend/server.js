const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
    // Auto-seed admin if it doesn't exist
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
        console.log(`Admin created: ${adminEmail}`);
    }
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
