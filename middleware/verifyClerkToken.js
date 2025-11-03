const axios = require("axios");

const verifyClerkToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "No token provided" });

    // Verify token with Clerk API
    const response = await axios.get("https://api.clerk.dev/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.clerkUser = response.data; // attach user info to request
    next();
  } catch (error) {
    console.error("Clerk verification failed:", error.response?.data || error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = verifyClerkToken;
