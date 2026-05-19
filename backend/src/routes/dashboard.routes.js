import express from "express";
import { getDashboardStats, getDashboardWeeklyData } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/weekly", getDashboardWeeklyData);

export default router;
