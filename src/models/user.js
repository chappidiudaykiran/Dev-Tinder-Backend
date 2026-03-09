const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        validate(value) {            if (!validator.isEmail(value)) {
                throw new Error('Invalid email format');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    age: {
        type: Number,
        min: 18,
        validate(value) {
            if (value < 18) {
                throw new Error('Age must be at least 18');
            }
        }
    },
    gender: {
        type: String,
        validate(value) {
            if(!['Male', 'Female', 'Other'].includes(value)) {
                throw new Error('Gender must be either  Male,Female or Other');
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            validate(value) {
            if (value && !validator.isURL(value)) {
                throw new Error('Invalid URL format for photoUrl');
            }
        }
    },
    about: {
        type: String,
        default: "This the default about section. Please update it to tell others more about you.",
    },
    skills: {
        type: [String],
    },
},
{    timestamps: true,
});

userSchema.methods.getJWT = function() {
    const user = this;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });
    return token;
};

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;