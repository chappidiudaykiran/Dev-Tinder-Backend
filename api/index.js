const app = require("../src/app");
const connectDB = require("../src/config/database");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("Request failed:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
