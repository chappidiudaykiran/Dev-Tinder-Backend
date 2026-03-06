const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require('./models/user'); // Import the User model

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
