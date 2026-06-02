import express from "express";
import {
  receiveGpsWebhook,
  getVehicleLocation,
  getVehicleHistory,
  getAllVehicleLocations,
  getTripEvents,
  getShipmentTracking,
} from "../controllers/gps.controller.js";

const router = express.Router();

// GPS device pushes here
router.post("/webhook", receiveGpsWebhook);

// Fleet overview
router.get("/all", getAllVehicleLocations);

// Per-vehicle
router.get("/location/:vehicleNo", getVehicleLocation);
router.get("/history/:vehicleNo", getVehicleHistory);

// Per-shipment
router.get("/events/:shipmentId", getTripEvents);
router.get("/shipment-track/:shipmentId", getShipmentTracking);

export default router;
