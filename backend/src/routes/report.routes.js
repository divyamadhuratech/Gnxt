import express from "express";
import { getShipmentStats, getFilterOptions } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/stats", getShipmentStats);
router.get("/filters", getFilterOptions);

export default router;
