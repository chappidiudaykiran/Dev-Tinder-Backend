const express = require("express");
const mongoose = require("mongoose");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionrequest");
const UserModel = require("../models/user");
requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try{
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected" });
    }

    const toUserId = req.params.toUserId?.trim();
    const fromUserId = req.user?._id;
    const status = req.params.status?.trim().toLowerCase();

    if (!fromUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "Invalid toUserId" });
    }

    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Status must be either 'ignored' or 'interested'." });
    }

    const toUser = await UserModel.findById(toUserId);
    if(!toUser){
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate requests in either direction between the same two users.
    const existingConnectionRequest = await ConnectionRequestModel.findOne({ 
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });
    if (existingConnectionRequest) {
      return res.status(400).json({ message: "Connection request already exists between the two users" });
    }
    const connectionRequest = new ConnectionRequestModel({
       fromUserId,
       toUserId,
       status,
    });

    const data=await connectionRequest.save();

    res.json({ message: req.user.firstName + " is " + status + " in " + toUser.firstName, data });


  }
  catch(error){
    console.error("Error sending connection request:", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    if (error?.message === "fromUserId and toUserId cannot be the same") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error?.message || "Internal server error" });
  }
});

module.exports = requestsRouter;