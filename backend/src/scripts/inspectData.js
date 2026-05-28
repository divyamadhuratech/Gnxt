import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Shipment from "../models/shipment.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const drivers = await Driver.find({}).lean();
  const vehicles = await Vehicle.find({}).lean();
  const shipments = await Shipment.find({}).lean();
  
  console.log("=== DRIVERS ===");
  console.log(JSON.stringify(drivers.map(d => ({ _id: d._id, name: d.name, tripStatus: d.tripStatus, assignedVehicle: d.assignedVehicle })), null, 2));
  
  console.log("\n=== VEHICLES ===");
  console.log(JSON.stringify(vehicles.map(v => ({ _id: v._id, vehicleNo: v.vehicleNo, status: v.status, availability: v.availability })), null, 2));
  
  console.log("\n=== SHIPMENTS ===");
  console.log(JSON.stringify(shipments.map(s => ({ _id: s._id, shipmentId: s.shipmentId, status: s.status, vehicleId: s.vehicleId, vehicleNumber: s.vehicleNumber, driverId: s.driverId, driverName: s.driverName })), null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
