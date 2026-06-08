import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetPassword,
  deleteUser,
  updatePermissions,
  updateRolePermissions,
  getActivityLog,
} from "../controllers/user.controller.js";
import { authenticate, requireSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All user management routes require authentication + Super Admin
router.use(authenticate);

router.get("/",                          getUsers);
router.post("/",                         requireSuperAdmin, createUser);
router.put("/role/permissions",          requireSuperAdmin, updateRolePermissions);
router.put("/:id",                       requireSuperAdmin, updateUser);
router.patch("/:id/status",              requireSuperAdmin, toggleUserStatus);
router.patch("/:id/password",            requireSuperAdmin, resetPassword);
router.delete("/:id",                    requireSuperAdmin, deleteUser);
router.put("/:id/permissions",           requireSuperAdmin, updatePermissions);
router.get("/activity-log",              getActivityLog);

export default router;
