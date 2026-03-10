const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user=req.user;
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(401).send("Invalid or expired token");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).send("User not found");
        }

        const allowedUpdates = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about', 'skills'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send("Invalid update fields");
        }
        Object.assign(user, req.body);
        await user.save();
        res.send("Profile updated successfully");
    } catch (err) {
        console.error("Error updating user profile:", err.message);
        res.status(401).send("Invalid or expired token");
    }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).send("Current and new passwords are required");
        }

        if (currentPassword === newPassword) {
            return res.status(400).send("New password must be different from current password");
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).send("Current password is incorrect");
        }

        user.password = newPassword;
        await user.save();
        res.send("Password updated successfully");
    } catch (err) {
        console.error("Error updating password:", err.message);
        res.status(400).send(err.message || "Unable to update password");
    }
});

module.exports = profileRouter;