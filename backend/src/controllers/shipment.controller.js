import Shipment from "../models/shipment.model.js";
import Invoice from "../models/invoice.model.js";
import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";

/* ─────────────────────────────────────────────────
   POST /api/shipments
   Create a new shipment
───────────────────────────────────────────────── */
export const createShipment = async (req, res) => {
  try {
    const { destinations, vehicleId, driverId, notes } = req.body;

    if (!destinations?.length) {
      return res.status(400).json({ success: false, message: "At least one destination is required" });
    }
    if (!vehicleId) return res.status(400).json({ success: false, message: "Vehicle is required" });
    if (!driverId)  return res.status(400).json({ success: false, message: "Driver is required" });

    // Validate vehicle exists
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    // Validate driver exists
    const driver = await Driver.findById(driverId).lean();
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    // Build destination docs — resolve customerName + location from invoices
    const destinationDocs = await Promise.all(destinations.map(async (d) => {
      let customerName     = "";
      let deliveryLocation = d.deliveryLocation || "";

      // Try selected invoiceIds first
      if (d.invoiceIds?.length) {
        const inv = await Invoice.findById(d.invoiceIds[0])
          .select("customerName location").lean();
        if (inv) {
          customerName     = inv.customerName || "";
          deliveryLocation = deliveryLocation || inv.location || "";
        }
      }

      // Fallback: look up any invoice for this plant to get customerName + location
      if ((!customerName || !deliveryLocation) && d.plantReferenceNumber) {
        const plantNumbers = d.plantReferenceNumber.split(",").map(p => p.trim()).filter(Boolean);
        const inv = await Invoice.findOne({ plantReferenceNumber: { $in: plantNumbers } })
          .select("customerName location").lean();
        if (inv) {
          customerName     = customerName     || inv.customerName || "";
          deliveryLocation = deliveryLocation || inv.location     || "";
        }
      }

      return {
        lrNumber: "",
        plantReferenceNumber: d.plantReferenceNumber,
        customerName,
        deliveryLocation,
        invoiceIds: d.invoiceIds || [],
        totalTyres: d.totalTyres || 0,
        totalTubes: d.totalTubes || 0,
        totalFlaps: d.totalFlaps || 0,
        weightKg: d.weightKg || 0,
      };
    }));

    const shipment = new Shipment({
      destinations: destinationDocs,
      vehicleId: vehicle._id,
      vehicleNumber: vehicle.vehicleNo,
      vehicleCapacityKg: vehicle.capacityKg,
      driverId: driver._id,
      driverName: driver.name,
      driverPhone: driver.phone,
      notes,
    });

    await shipment.save();

    // Mark selected invoices as Assigned
    const allInvoiceIds = destinationDocs.reduce((acc, dest) => {
      if (dest.invoiceIds?.length) {
        acc.push(...dest.invoiceIds);
      }
      return acc;
    }, []);

    if (allInvoiceIds.length) {
      await Invoice.updateMany(
        { _id: { $in: allInvoiceIds } },
        { status: "Assigned" }
      );
    }

    // Mark vehicle as Scheduled / Assigned
    await Vehicle.findByIdAndUpdate(vehicleId, { availability: "Scheduled", status: "Assigned" });
    // Mark driver as Assigned
    await Driver.findByIdAndUpdate(driverId, { tripStatus: "Assigned", assignedVehicle: vehicle.vehicleNo });

    res.status(201).json({ success: true, message: "Shipment created", data: shipment });
  } catch (err) {
    console.error("Create shipment error:", err);
    res.status(500).json({ success: false, message: "Error creating shipment", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments
   List shipments with optional filters
───────────────────────────────────────────────── */
export const getShipments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;
    if (search) {
      const r = { $regex: search, $options: "i" };
      query.$or = [
        { shipmentId: r },
        { vehicleNumber: r },
        { driverName: r },
        { "destinations.plantReferenceNumber": r },
        { "destinations.lrNumber": r },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [shipments, total] = await Promise.all([
      Shipment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("destinations.invoiceIds", "invoiceNumber invoiceDate customerName location")
        .lean(),
      Shipment.countDocuments(query),
    ]);

    // Backfill customerName + deliveryLocation for destinations that are missing them
    // (records created before the denormalization fix)
    const enriched = await Promise.all(shipments.map(async (s) => {
      const destinations = await Promise.all((s.destinations ?? []).map(async (dest) => {
        if (dest.customerName && dest.deliveryLocation) return dest; // already set

        // Try populated invoices first
        const popInv = (dest.invoiceIds ?? []).find((inv) => typeof inv === "object");
        let customerName     = dest.customerName     || popInv?.customerName || "";
        let deliveryLocation = dest.deliveryLocation || popInv?.location     || "";

        // Fallback: look up by plantReferenceNumber
        if ((!customerName || !deliveryLocation) && dest.plantReferenceNumber) {
          const plantNumbers = dest.plantReferenceNumber.split(",").map(p => p.trim()).filter(Boolean);
          const inv = await Invoice.findOne({ plantReferenceNumber: { $in: plantNumbers } })
            .select("customerName location").lean();
          customerName     = customerName     || inv?.customerName || "";
          deliveryLocation = deliveryLocation || inv?.location     || "";
        }

        return { ...dest, customerName, deliveryLocation };
      }));
      return { ...s, destinations };
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error("Get shipments error:", err);
    res.status(500).json({ success: false, message: "Error fetching shipments", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments/:id
───────────────────────────────────────────────── */
export const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("vehicleId", "vehicleNo type model capacityKg")
      .populate("driverId", "name phone licenseNumber driverType")
      .populate("destinations.invoiceIds", "invoiceNumber invoiceDate plantReferenceNumber customerName location")
      .lean();

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    // Backfill customerName + deliveryLocation for destinations if missing
    const enrichedDestinations = await Promise.all((shipment.destinations ?? []).map(async (dest) => {
      let customerName     = dest.customerName || "";
      let deliveryLocation = dest.deliveryLocation || "";

      // Try populated invoices first
      const popInv = (dest.invoiceIds ?? []).find((inv) => typeof inv === "object");
      customerName     = customerName     || popInv?.customerName || "";
      deliveryLocation = deliveryLocation || popInv?.location     || "";

      // Fallback lookup
      if ((!customerName || !deliveryLocation) && dest.plantReferenceNumber) {
        const plantNumbers = dest.plantReferenceNumber.split(",").map(p => p.trim()).filter(Boolean);
        const inv = await Invoice.findOne({ plantReferenceNumber: { $in: plantNumbers } })
          .select("customerName location").lean();
        customerName     = customerName     || inv?.customerName || "";
        deliveryLocation = deliveryLocation || inv?.location     || "";
      }

      return { ...dest, customerName, deliveryLocation };
    }));

    shipment.destinations = enrichedDestinations;

    res.status(200).json({ success: true, data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching shipment", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   PATCH /api/shipments/:id/status
───────────────────────────────────────────────── */
export const updateShipmentStatus = async (req, res) => {
  try {
    const { status, podReceiverName, podRemarks, podImages, destinationId } = req.body;
    const allowed = ["Pending", "In Transit", "Delivered", "Returned", "Cancelled", "Closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (destinationId) {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

      const dest = shipment.destinations.id(destinationId);
      if (!dest) return res.status(404).json({ success: false, message: "Destination not found" });

      dest.status = status;
      if (podReceiverName !== undefined) dest.podReceiverName = podReceiverName;
      if (podRemarks !== undefined) dest.podRemarks = podRemarks;
      if (podImages !== undefined) dest.podImages = podImages;

      const allDelivered = shipment.destinations.every((d) => d.status === "Delivered");
      if (allDelivered) {
        shipment.status = "Delivered";
        shipment.deliveryDate = new Date();
      }

      await shipment.save();

      if (dest.invoiceIds?.length) {
        let targetInvoiceStatus = "Assigned";
        if (status === "Delivered") {
          targetInvoiceStatus = "Delivered";
        }
        const rawInvoiceIds = dest.invoiceIds.map(inv => inv?._id || inv);
        await Invoice.updateMany(
          { _id: { $in: rawInvoiceIds } },
          { status: targetInvoiceStatus }
        );
      }

      const populatedShipment = await Shipment.findById(shipment._id)
        .populate("vehicleId", "vehicleNo type model capacityKg")
        .populate("driverId", "name phone licenseNumber driverType")
        .lean();

      return res.status(200).json({ success: true, message: "Destination status updated", data: populatedShipment });
    }

    const updateFields = {
      status,
      ...(status === "Delivered" ? { deliveryDate: new Date() } : {}),
      ...(status === "In Transit" ? { dispatchDate: new Date() } : {}),
      ...(status === "Returned" ? { returnedDate: new Date() } : {}),
      ...(podReceiverName !== undefined ? { podReceiverName } : {}),
      ...(podRemarks !== undefined ? { podRemarks } : {}),
      ...(podImages !== undefined ? { podImages } : {}),
    };

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    )
      .populate("vehicleId", "vehicleNo type model capacityKg")
      .populate("driverId", "name phone licenseNumber driverType")
      .lean();
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    // Free vehicle & driver when returned or cancelled
    if (status === "Returned" || status === "Cancelled") {
      const vId = shipment.vehicleId?._id || shipment.vehicleId;
      const dId = shipment.driverId?._id || shipment.driverId;
      if (vId) {
        await Vehicle.findByIdAndUpdate(vId, { availability: "Available", status: "Idle" });
      }
      if (dId) {
        await Driver.findByIdAndUpdate(dId, { tripStatus: "Idle", assignedVehicle: null });
      }
    }

    // Set vehicle & driver to In Transit when dispatched
    if (status === "In Transit") {
      const vId = shipment.vehicleId?._id || shipment.vehicleId;
      const dId = shipment.driverId?._id || shipment.driverId;
      if (vId) {
        await Vehicle.findByIdAndUpdate(vId, { availability: "On Trip", status: "In Transit" });
      }
      if (dId) {
        await Driver.findByIdAndUpdate(dId, { tripStatus: "In Transit", assignedVehicle: shipment.vehicleNumber });
      }
    }

    // Sync invoice statuses
    const allInvoiceIds = shipment.destinations?.reduce((acc, dest) => {
      if (dest.invoiceIds?.length) {
        acc.push(...dest.invoiceIds.map(inv => inv?._id || inv));
      }
      return acc;
    }, []) || [];

    if (allInvoiceIds.length) {
      let targetInvoiceStatus = "Assigned";
      if (status === "In Transit") {
        targetInvoiceStatus = "In Transit";
      } else if (status === "Delivered" || status === "Closed") {
        targetInvoiceStatus = "Delivered";
      } else if (status === "Returned" || status === "Cancelled") {
        targetInvoiceStatus = "Pending";
      }

      await Invoice.updateMany(
        { _id: { $in: allInvoiceIds } },
        { status: targetInvoiceStatus }
      );
    }

    res.status(200).json({ success: true, message: "Status updated", data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   PUT /api/shipments/:id
   Update an existing shipment (vehicle, driver, destinations)
───────────────────────────────────────────────── */
export const updateShipment = async (req, res) => {
  try {
    const { destinations, vehicleId, driverId, notes } = req.body;

    // Fetch existing shipment to handle vehicle/driver swaps
    const existing = await Shipment.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ success: false, message: "Shipment not found" });

    const vehicle = vehicleId ? await Vehicle.findById(vehicleId).lean() : null;
    const driver  = driverId  ? await Driver.findById(driverId).lean()   : null;

    const update = { notes };

    // ── Vehicle change ──────────────────────────────
    if (vehicle) {
      // Free old vehicle if different
      if (existing.vehicleId?.toString() !== vehicle._id.toString()) {
        await Vehicle.findByIdAndUpdate(existing.vehicleId, { availability: "Available", status: "Idle" });
        await Vehicle.findByIdAndUpdate(vehicle._id, { availability: "On Trip", status: "In Transit" });
      }
      update.vehicleId         = vehicle._id;
      update.vehicleNumber     = vehicle.vehicleNo;
      update.vehicleCapacityKg = vehicle.capacityKg;
    }

    // ── Driver change ───────────────────────────────
    if (driver) {
      // Free old driver if different
      if (existing.driverId?.toString() !== driver._id.toString()) {
        await Driver.findByIdAndUpdate(existing.driverId, { tripStatus: "Idle", assignedVehicle: null });
        await Driver.findByIdAndUpdate(driver._id, { tripStatus: "Assigned", assignedVehicle: vehicle?.vehicleNo || existing.vehicleNumber });
      }
      update.driverId    = driver._id;
      update.driverName  = driver.name;
      update.driverPhone = driver.phone;
    }

    // ── Status logic on update ──────────────────────
    // If vehicle or driver changed and shipment is Pending → move to In Transit
    const vehicleChanged = vehicle && existing.vehicleId?.toString() !== vehicle._id.toString();
    const driverChanged  = driver  && existing.driverId?.toString()  !== driver._id.toString();
    if ((vehicleChanged || driverChanged) && existing.status === "Pending") {
      update.status       = "In Transit";
      update.dispatchDate = new Date();
    }

    // ── Destinations ────────────────────────────────
    if (destinations?.length) {
      // Re-resolve customerName + location from invoices (same as create)
      const resolvedDests = await Promise.all(destinations.map(async (d, i) => {
        let customerName     = d.customerName     || "";
        let deliveryLocation = d.deliveryLocation || "";

        // Try selected invoiceIds first
        if (d.invoiceIds?.length) {
          const inv = await Invoice.findById(d.invoiceIds[0])
            .select("customerName location").lean();
          if (inv) {
            customerName     = customerName     || inv.customerName || "";
            deliveryLocation = deliveryLocation || inv.location     || "";
          }
        }

        // Fallback: look up by plantReferenceNumber
        if ((!customerName || !deliveryLocation) && d.plantReferenceNumber) {
          const plantNumbers = d.plantReferenceNumber.split(",").map(p => p.trim()).filter(Boolean);
          const inv = await Invoice.findOne({ plantReferenceNumber: { $in: plantNumbers } })
            .select("customerName location").lean();
          if (inv) {
            customerName     = customerName     || inv.customerName || "";
            deliveryLocation = deliveryLocation || inv.location     || "";
          }
        }

        const existingLr = existing.destinations?.[i]?.lrNumber || d.lrNumber || "";

        return {
          lrNumber: existingLr,
          plantReferenceNumber: d.plantReferenceNumber,
          customerName,
          deliveryLocation,
          invoiceIds: d.invoiceIds || [],
          totalTyres: d.totalTyres || 0,
          totalTubes: d.totalTubes || 0,
          totalFlaps: d.totalFlaps || 0,
          weightKg: d.weightKg || 0,
          totalQuantity: (d.totalTyres || 0) + (d.totalTubes || 0) + (d.totalFlaps || 0),
        };
      }));

      update.destinations  = resolvedDests;
      update.totalWeightKg = resolvedDests.reduce((s, d) => s + (d.weightKg || 0), 0);
      update.totalQuantity = resolvedDests.reduce((s, d) => s + (d.totalQuantity || 0), 0);

      // Revert old invoices to Pending
      const oldInvoiceIds = existing.destinations?.reduce((acc, dest) => {
        if (dest.invoiceIds?.length) {
          acc.push(...dest.invoiceIds);
        }
        return acc;
      }, []) || [];

      if (oldInvoiceIds.length) {
        await Invoice.updateMany(
          { _id: { $in: oldInvoiceIds } },
          { status: "Pending" }
        );
      }

      // Mark the new set of invoices as Assigned (or current status)
      const newInvoiceIds = resolvedDests.reduce((acc, dest) => {
        if (dest.invoiceIds?.length) {
          acc.push(...dest.invoiceIds);
        }
        return acc;
      }, []);

      if (newInvoiceIds.length) {
        const targetStatus = update.status || existing.status || "Assigned";
        let invoiceStatus = "Assigned";
        if (targetStatus === "In Transit") invoiceStatus = "In Transit";
        else if (targetStatus === "Delivered") invoiceStatus = "Delivered";

        await Invoice.updateMany(
          { _id: { $in: newInvoiceIds } },
          { status: invoiceStatus }
        );
      }
    }

    const shipment = await Shipment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("vehicleId", "vehicleNo type model capacityKg")
      .populate("driverId", "name phone licenseNumber driverType")
      .lean();
    res.status(200).json({ success: true, message: "Shipment updated", data: shipment });
  } catch (err) {
    console.error("Update shipment error:", err);
    res.status(500).json({ success: false, message: "Error updating shipment", error: err.message });
  }
};


export const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndDelete(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    // Free associated vehicle & driver when shipment is deleted
    const vId = shipment.vehicleId?._id || shipment.vehicleId;
    const dId = shipment.driverId?._id || shipment.driverId;
    if (vId) {
      await Vehicle.findByIdAndUpdate(vId, { availability: "Available", status: "Idle" });
    }
    if (dId) {
      await Driver.findByIdAndUpdate(dId, { tripStatus: "Idle", assignedVehicle: null });
    }

    // Revert associated invoices back to Pending
    const allInvoiceIds = shipment.destinations?.reduce((acc, dest) => {
      if (dest.invoiceIds?.length) {
        acc.push(...dest.invoiceIds);
      }
      return acc;
    }, []) || [];

    if (allInvoiceIds.length) {
      await Invoice.updateMany(
        { _id: { $in: allInvoiceIds } },
        { status: "Pending" }
      );
    }

    res.status(200).json({ success: true, message: "Shipment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting shipment", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments/invoices-by-plant/:plantRef
   Returns invoices for a plant (for the create form)
───────────────────────────────────────────────── */
export const getInvoicesByPlant = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      plantReferenceNumber: req.params.plantRef,
      status: { $in: ["Pending"] },
    })
      .select("invoiceNumber invoiceDate status location customerName plantReferenceNumber")
      .sort({ invoiceDate: -1 })
      .lean();

    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching invoices", error: err.message });
  }
};

/* ── GET /api/shipments/next-id
   Returns the next shipment ID that will be generated (preview)
───────────────────────────────────────────────── */
export const getNextShipmentId = async (req, res) => {
  try {
    const year   = new Date().getFullYear();
    const prefix = `SHP-${year}-`;
    const last   = await Shipment.findOne(
      { shipmentId: { $regex: `^${prefix}` } },
      { shipmentId: 1 },
      { sort: { shipmentId: -1 } }
    ).lean();

    let next = 1;
    if (last?.shipmentId) {
      const seq = parseInt(last.shipmentId.replace(prefix, ""), 10);
      if (!isNaN(seq)) next = seq + 1;
    }

    const nextShipmentId = `${prefix}${String(next).padStart(5, "0")}`;
    // LR numbers follow the same sequence: LR-YYYY-NNNNN-01, -02, etc.
    const lrPrefix = `LR-${year}-${String(next).padStart(5, "0")}`;

    res.status(200).json({ success: true, data: { nextShipmentId, lrPrefix, sequence: next } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching next ID", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments/plant-numbers
   Returns distinct plant reference numbers from invoices
───────────────────────────────────────────────── */
export const getPlantNumbers = async (req, res) => {
  try {
    const plants = await Invoice.distinct("plantReferenceNumber", { status: "Pending" });
    res.status(200).json({ success: true, data: plants.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching plant numbers", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments/by-driver/:driverId
   Returns all shipments assigned to a specific driver
───────────────────────────────────────────────── */
export const getShipmentsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const shipments = await Shipment.find({ driverId })
      .sort({ createdAt: -1 })
      .populate("vehicleId", "vehicleNo type model capacityKg")
      .lean();

    res.status(200).json({ success: true, data: shipments });
  } catch (err) {
    console.error("Get shipments by driver error:", err);
    res.status(500).json({ success: false, message: "Error fetching driver shipments", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   GET /api/shipments/related-plants/:plantRef
   Returns distinct plant numbers sharing the same customerName and location from invoices
───────────────────────────────────────────────── */
export const getRelatedPlants = async (req, res) => {
  try {
    const { plantRef } = req.params;

    // Find the customer and location of the current plantRef from invoices
    const refInvoice = await Invoice.findOne({ plantReferenceNumber: plantRef })
      .select("customerName location")
      .lean();

    if (!refInvoice) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Find all OTHER plant numbers that share the same customerName and location and are Pending
    const related = await Invoice.distinct("plantReferenceNumber", {
      plantReferenceNumber: { $ne: plantRef },
      customerName: refInvoice.customerName,
      location: refInvoice.location,
      status: "Pending"
    });

    res.status(200).json({ success: true, data: related.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching related plants", error: err.message });
  }
};
