
import express from "express";
import {
  getInvoices,
  uploadInvoiceSheet,
   updateInvoiceStatus,
  toggleInvoiceCheck,
  
} from "../controllers/invoice.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Upload Excel
router.post("/upload", upload.single("file"), uploadInvoiceSheet);

// Get invoices (for table)
router.get("/", getInvoices);

router.patch("/:plantId/status", updateInvoiceStatus);

router.patch(
  "/:plantId/check/:invoiceNumber",
  toggleInvoiceCheck
);

export default router;