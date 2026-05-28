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

  // Find the seeded vehicle
  const vehicle = await Vehicle.findOne({ vehicleNo: "KL07DC9716" });
  if (!vehicle) {
    console.log("Seeded vehicle KL07DC9716 not found. Please run seed script first.");
    await mongoose.disconnect();
    return;
  }

  console.log("Found vehicle to delete:", vehicle._id, vehicle.vehicleNo);

  // SIMULATE deleteVehicle logic
  const vId = vehicle._id;
  const vNo = vehicle.vehicleNo;

  // 1. Reset driver assigned this vehicle
  console.log("Resetting drivers...");
  const resetDriversRes = await Driver.updateMany(
    { assignedVehicle: vNo },
    { assignedVehicle: null, tripStatus: "Idle" }
  );
  console.log("Drivers reset result:", resetDriversRes);

  // 2. Cancel active shipments
  console.log("Canceling shipments...");
  const activeShipments = await Shipment.find({
    vehicleId: vId,
    status: { $in: ["Pending", "In Transit"] },
  }).lean();

  console.log(`Found ${activeShipments.length} active shipments to cancel.`);
  for (const s of activeShipments) {
    if (s.driverId) {
      console.log(`Resetting driver ${s.driverId} on shipment ${s.shipmentId}`);
      await Driver.findByIdAndUpdate(s.driverId, { tripStatus: "Idle", assignedVehicle: null });
    }
    const invoiceIds = (s.destinations || []).flatMap((d) => d.invoiceIds || []);
    if (invoiceIds.length > 0) {
      await Invoice.updateMany({ _id: { $in: invoiceIds } }, { status: "Pending" });
    }
    await Shipment.findByIdAndUpdate(s._id, { status: "Cancelled" });
  }

  // 3. Delete vehicle
  await Vehicle.findByIdAndDelete(vId);
  console.log("Vehicle deleted from database.");

  // Check state
  const driverState = await Driver.find({ name: { $in: ["Arun Kumar", "babu"] } }).lean();
  console.log("Drivers after deletion:", driverState.map(d => ({ name: d.name, tripStatus: d.tripStatus, assignedVehicle: d.assignedVehicle })));

  const shipmentState = await Shipment.find({ vehicleId: vId }).lean();
  console.log("Shipments after deletion:", shipmentState.map(s => ({ shipmentId: s.shipmentId, status: s.status })));

  await mongoose.disconnect();
}

run().catch(console.error);
