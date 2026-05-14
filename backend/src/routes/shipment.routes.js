import express from "express";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  updateShipment,
  deleteShipment,
  getInvoicesByPlant,
  getPlantNumbers,
  getNextShipmentId,
} from "../controllers/shipment.controller.js";

const router = express.Router();

// Preview next auto-generated IDs (must be before /:id)
router.get("/next-id",                        getNextShipmentId);

// Plant data helpers (used by create form)
router.get("/plant-numbers",                  getPlantNumbers);
router.get("/invoices-by-plant/:plantRef",    getInvoicesByPlant);

// Shipment CRUD
router.post("/",                              createShipment);
router.get("/",                               getShipments);
router.get("/:id",                            getShipmentById);
router.patch("/:id/status",                   updateShipmentStatus);
router.put("/:id",                            updateShipment);
router.delete("/:id",                         deleteShipment);

export default router;
