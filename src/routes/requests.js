const express = require("express");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

requestsRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  console.log("Received connection request with data:", req.body);
  res.send("Connection request sent successfully");
});

module.exports = requestsRouter;