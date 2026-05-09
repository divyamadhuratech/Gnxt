import express from "express";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
  getFleetStats,
  searchVehicles,
  filterVehicles,
} from "../controllers/vehicleController.js";

const router = express.Router();

// GET routes (must be before /:id to avoid conflicts)
router.get("/stats", getFleetStats);
router.get("/search", searchVehicles);
router.get("/filter", filterVehicles);

// CRUD routes
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.patch("/:id/status", updateVehicleStatus);
router.delete("/:id", deleteVehicle);

export default router;
