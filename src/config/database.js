const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://udaykiran24689_db_user:70HXSzyS4iRwYEML@project0.stmb8pq.mongodb.net/devTinder',
        );
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }   
};

module.exports = connectDB; 