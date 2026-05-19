import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

const JWT_SECRET  = process.env.JWT_SECRET  || "gnxt_super_secret_2026";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

/* ── Helper: get client IP ── */
const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
  req.socket?.remoteAddress ||
  "Unknown";

/* ── POST /api/auth/login ── */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = getIp(req);

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    // Find by username or email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
      ],
    });

    if (!user) {
      await ActivityLog.create({
        userName: username,
        action: "Failed Login",
        target: "System",
        ipAddress: ip,
        status: "Failed",
      });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ success: false, message: "Account is inactive. Contact admin." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await ActivityLog.create({
        userId: user._id,
        userName: user.username,
        action: "Failed Login",
        target: "System",
        ipAddress: ip,
        status: "Failed",
      });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Log success
    await ActivityLog.create({
      userId: user._id,
      userName: user.username,
      action: "Login",
      target: "System",
      ipAddress: ip,
      status: "Success",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
};

/* ── POST /api/auth/logout ── */
export const logout = async (req, res) => {
  try {
    const ip = getIp(req);
    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: "Logout",
        target: "System",
        ipAddress: ip,
        status: "Success",
      });
    }
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout error", error: err.message });
  }
};

/* ── GET /api/auth/me ── */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile", error: err.message });
  }
};
