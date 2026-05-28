/**
 * repairInvoiceLinks.js
 * 
 * One-time repair script:
 * 1. For every shipment destination with empty invoiceIds,
 *    find all invoices matching the plantReferenceNumber and link them.
 * 2. Update invoice statuses based on shipment status.
 * 3. Sync vehicle and driver statuses to match shipment status.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Shipment from "../models/shipment.model.js";
import Invoice from "../models/invoice.model.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";

const INVOICE_STATUS_MAP = {
  "Pending":    "Assigned",
  "In Transit": "In Transit",
  "Delivered":  "Delivered",
  "Returned":   "Delivered",
  "Cancelled":  "Pending",
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB:", process.env.MONGO_URI);

  const shipments = await Shipment.find({}).lean();
  console.log(`Found ${shipments.length} shipments to check.\n`);

  let repairedShipments = 0;
  let linkedInvoices    = 0;

  for (const shipment of shipments) {
    console.log(`Processing ${shipment.shipmentId} (${shipment.status})...`);
    let needsDestUpdate = false;
    const updatedDestinations = [];

    for (const dest of shipment.destinations) {
      const targetInvoiceStatus = INVOICE_STATUS_MAP[shipment.status] || "Assigned";

      if (dest.invoiceIds && dest.invoiceIds.length > 0) {
        // Already linked — sync invoice status
        const result = await Invoice.updateMany(
          { _id: { $in: dest.invoiceIds } },
          { status: targetInvoiceStatus }
        );
        if (result.modifiedCount > 0) {
          console.log(`  ✓ Synced ${result.modifiedCount} invoices for plant ${dest.plantReferenceNumber} → ${targetInvoiceStatus}`);
          linkedInvoices += result.modifiedCount;
        }
        updatedDestinations.push(dest);
      } else if (dest.plantReferenceNumber) {
        // No invoiceIds — find by plant reference number
        const invoices = await Invoice.find({
          plantReferenceNumber: dest.plantReferenceNumber,
        }).select("_id").lean();

        if (invoices.length > 0) {
          const ids = invoices.map((i) => i._id);
          const result = await Invoice.updateMany(
            { _id: { $in: ids } },
            { status: targetInvoiceStatus }
          );
          console.log(`  ✓ Linked+synced ${ids.length} invoices for plant ${dest.plantReferenceNumber} → ${targetInvoiceStatus}`);
          linkedInvoices += result.modifiedCount;
          updatedDestinations.push({ ...dest, invoiceIds: ids });
          needsDestUpdate = true;
        } else {
          console.log(`  ⚠ No invoices found for plant ${dest.plantReferenceNumber}`);
          updatedDestinations.push(dest);
        }
      } else {
        updatedDestinations.push(dest);
      }
    }

    if (needsDestUpdate) {
      await Shipment.findByIdAndUpdate(shipment._id, { destinations: updatedDestinations });
      repairedShipments++;
    }

    // ── Sync vehicle & driver to match shipment status ──────────────────────
    if (shipment.status === "In Transit") {
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "On Trip", status: "In Transit" });
      await Driver.findByIdAndUpdate(shipment.driverId,  { tripStatus: "Driving" });
      console.log(`  ✓ Vehicle → On Trip/In Transit, Driver → Driving`);
    } else if (shipment.status === "Pending") {
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "Assigned", status: "Active" });
      await Driver.findByIdAndUpdate(shipment.driverId,  { tripStatus: "Assigned" });
      console.log(`  ✓ Vehicle → Assigned/Active, Driver → Assigned`);
    } else if (["Delivered", "Returned", "Cancelled"].includes(shipment.status)) {
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "Available", status: "Idle" });
      await Driver.findByIdAndUpdate(shipment.driverId,  { tripStatus: "Idle", assignedVehicle: null });
      console.log(`  ✓ Vehicle → Available/Idle, Driver → Idle`);
    }
  }

  console.log(`\n✅ Done. Repaired ${repairedShipments} shipment destinations, updated ${linkedInvoices} invoices.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
