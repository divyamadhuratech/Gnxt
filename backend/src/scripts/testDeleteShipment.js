import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Shipment from "../models/shipment.model.js";
import Invoice from "../models/invoice.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database");

  // Find the seeded shipment
  const shipment = await Shipment.findOne({ shipmentId: "SHP-2026-00001" });
  if (!shipment) {
    console.log("Seeded shipment SHP-2026-00001 not found. Please run seed script first.");
    await mongoose.disconnect();
    return;
  }

  console.log("Found shipment to delete:", shipment._id, shipment.shipmentId);

  // SIMULATE deleteShipment logic
  const sId = shipment._id;
  const dId = shipment.driverId;
  const vId = shipment.vehicleId;

  console.log("Freeing driver back to Idle. driverId:", dId);
  if (dId) {
    const dRes = await Driver.findByIdAndUpdate(dId, {
      tripStatus: "Idle",
      assignedVehicle: null,
    });
    console.log("Driver update result:", dRes ? "Success" : "Failed");
  }

  console.log("Freeing vehicle back to Available. vehicleId:", vId);
  if (vId) {
    const vRes = await Vehicle.findByIdAndUpdate(vId, {
      availability: "Available",
      status: "Idle",
    });
    console.log("Vehicle update result:", vRes ? "Success" : "Failed");
  }

  const invoiceIdsToFree = [];
  (shipment.destinations || []).forEach((d) => {
    if (d.invoiceIds?.length) invoiceIdsToFree.push(...d.invoiceIds);
  });
  console.log("Freeing invoices:", invoiceIdsToFree);
  if (invoiceIdsToFree.length > 0) {
    await Invoice.updateMany({ _id: { $in: invoiceIdsToFree } }, { status: "Pending" });
  }

  await Shipment.findByIdAndDelete(sId);
  console.log("Shipment deleted from database.");

  // Check state
  const driverState = await Driver.findById(dId).lean();
  console.log("Driver after deletion:", { name: driverState?.name, tripStatus: driverState?.tripStatus, assignedVehicle: driverState?.assignedVehicle });

  const vehicleState = await Vehicle.findById(vId).lean();
  console.log("Vehicle after deletion:", { vehicleNo: vehicleState?.vehicleNo, availability: vehicleState?.availability, status: vehicleState?.status });

  await mongoose.disconnect();
}

run().catch(console.error);
