const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    console.log("Received signup request with data:", req.body);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailId: req.body.emailId,
      password: req.body.password,
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
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);
    res.send("Login successful");
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).send("some error occurred");
  }
});

authRouter.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
  });
  res.send("Logout successful");
});

module.exports = authRouter;