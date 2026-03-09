const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Received signup request with data:", req.body);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailId: req.body.emailId,
      password: passwordHash,
      age: req.body.age,
      gender: req.body.gender,
      photoUrl: req.body.photoUrl,
      about: req.body.about,
      skills: req.body.skills,
    });
    await user.save();
    res.status(201).send("User signed up successfully");
  } catch (err) {
    console.error("Signup failed:", err.message);
    res.status(400).send(err.message || "Error creating user");
  }
});

authRouter.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    if (!emailId || !password) {
      return res.status(400).send("emailId and password are required");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).send("Invalid credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.send("Login successful");
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).send("some error occurred");
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logout successful");
});

module.exports = authRouter;