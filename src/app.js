const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user"); // Import the User model
const mongoose = require("mongoose");

app.use(express.json()); // Middleware to parse JSON request bodies
app.post("/signup", async (req, res) => {
  try {
    console.log("Received signup request with data:", req.body);
    const user = new User(req.body);
    await user.save();
    res.status(201).send("User signed up successfully");
  } catch (err) {
    console.error("Signup failed:", err.message);
    res.status(500).send("Error creating user");
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.query.emailId;
  try {
    if (!userEmail) {
      return res.status(400).send("emailId query param is required");
    }

    const user = await User.find({ emailId: userEmail });
    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).send("some error occurred");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
    try {
        if (!userId) {
      return res.status(400).send("userId is required in request body");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid userId");
        }
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
      return res.status(404).send("User not found");
        } else {            res.send("User deleted successfully");
        }
    } catch (err) {
        console.error("Error deleting user:", err.message);
        res.status(500).send("some error occurred");
    }
});

app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const updateData = req.body.updateData || {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailId: req.body.emailId,
    password: req.body.password,
    age: req.body.age,
    gender: req.body.gender,
  };
    try {
        if (!userId) {
      return res.status(400).send("userId is required in request body");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid userId");
        }
        const cleanedUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        if (Object.keys(cleanedUpdateData).length === 0) {
          return res.status(400).send("No fields provided for update");
        }
        const user = await User.findByIdAndUpdate(userId, cleanedUpdateData, { new: true });
        if (!user) {
      return res.status(404).send("User not found");
        } else {            res.send(user);
            runvalidators: true
            
        }       
    } catch (err) {
        console.error("Error updating user:", err.message);
        res.status(500).send("some error occurred");
    }
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the application if the database connection fails
  });
