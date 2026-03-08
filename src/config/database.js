const mongoose = require('mongoose');

const connectDB = async () => {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
        throw new Error('MONGODB_URI is not configured');
    }

    try {
        await mongoose.connect(dbUri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};

module.exports = connectDB; 