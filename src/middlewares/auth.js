const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }

        const decodedmessage = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedmessage.userId).select("-password");
        if (!user) {
            return res.status(401).send("Unauthorized: Invalid token");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Error in user auth middleware:", err.message);
        return res.status(401).send("Unauthorized");
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }

        const decodedmessage = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedmessage.userId).select("-password");
        if (!user) {
            return res.status(401).send("Unauthorized: Invalid token");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Error in admin auth middleware:", err.message);
        return res.status(401).send("Unauthorized");
    }
};

module.exports = {
    adminAuth,
    userAuth,
};