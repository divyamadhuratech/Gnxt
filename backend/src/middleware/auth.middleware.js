import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "gnxt_super_secret_2026";

/* ── Verify JWT token ── */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Bypass database lookup if static admin user ID is decoded
    if (decoded.id === "000000000000000000000001") {
      req.user = { id: "000000000000000000000001", username: "admin", role: "Super Admin" };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.status === "Inactive") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = { id: user._id.toString(), username: user.username, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/* ── Require Super Admin ── */
export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({ success: false, message: "Super Admin access required" });
  }
  next();
};
