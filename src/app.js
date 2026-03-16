const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON request bodies
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent with requests
}));
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestsRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestsRouter);
app.use("/", userRouter);

const PORT = process.env.PORT || 3000;
let isServerStarted = false;

const startServer = () => {
  if (isServerStarted) {
    return;
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  isServerStarted = true;
};

const connectWithRetry = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.log("Retrying MongoDB connection in 10 seconds...");
    setTimeout(connectWithRetry, 10000);
  }
};

startServer();
connectWithRetry();
