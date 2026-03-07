const validator = require('validator');

const validateSignUpData=(req) => {
    const { firstName, lastName, emailId, password, age, gender } = req.body;
    if (!firstName || !lastName || !emailId || !password) {
        throw new Error('Missing required fields: firstName, lastName, emailId, and password are required');
    }
    if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        throw new Error('firstName and lastName must be strings');
    }
    if (typeof emailId !== 'string' || !/\S+@\S+\.\S+/.test(emailId)) {
        throw new Error('Invalid email format');
    }
    if (
        typeof password !== 'string' ||
        !validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
    ) {
        throw new Error('Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol');
    }
    if (age !== undefined) {
        if (typeof age !== 'number' || age < 18) {
            throw new Error('Age must be a number and at least 18');
        }
    }
    if (gender !== undefined) {
        if (typeof gender !== 'string' || !['Male', 'Female', 'Other'].includes(gender)) {
            throw new Error('Gender must be either Male or Female or Other');
        }
    }
};

module.exports = {
    validateSignUpData,
};