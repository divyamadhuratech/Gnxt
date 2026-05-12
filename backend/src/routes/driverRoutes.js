import express from "express";
import * as driverController from "../controllers/driverController.js";

const router = express.Router();

// CRUD operations
router.get("/", driverController.getDrivers);
router.post("/", driverController.createDriver);
router.get("/search", driverController.searchDrivers);
router.get("/type/:type", driverController.getDriversByType);
router.get("/status/:status", driverController.getDriversByStatus);
router.get("/:id", driverController.getDriverById);
router.put("/:id", driverController.updateDriver);
router.delete("/:id", driverController.deleteDriver);

// Special endpoints
router.put("/:id/performance", driverController.updateDriverPerformance);
router.put("/:id/documents", driverController.updateDriverDocuments);

export default router;