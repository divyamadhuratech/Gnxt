import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";
// POD-point of delivery
import vehicleRoutes from "./routes/vehicleRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/api/invoices", invoiceRoutes);
app.use("/api/shipments", shipmentRoutes);

// Routes
app.use("/api/vehicles", vehicleRoutes);

//Drivers
app.use("/api/drivers", driverRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});