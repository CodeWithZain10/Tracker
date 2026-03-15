const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Log more info if connection fails
        if (process.env.MONGODB_URI) {
            console.error('Using URI:', process.env.MONGODB_URI.split('@')[1] ? '***@' + process.env.MONGODB_URI.split('@')[1] : 'Local/Hidden URI');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
