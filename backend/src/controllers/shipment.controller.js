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
    // Also auto-collect ALL pending invoices for the plant if none were explicitly selected
    const destinationDocs = await Promise.all(destinations.map(async (d) => {
      let customerName     = "";
      let deliveryLocation = d.deliveryLocation || "";
      let invoiceIds       = d.invoiceIds || [];

      // If no invoices were manually selected, auto-include ALL Pending invoices for this plant
      if (invoiceIds.length === 0 && d.plantReferenceNumber) {
        const pendingInvoices = await Invoice.find({
          plantReferenceNumber: d.plantReferenceNumber,
          status: "Pending",
        }).select("_id customerName location").lean();
        invoiceIds = pendingInvoices.map((inv) => inv._id);
        if (pendingInvoices.length > 0) {
          customerName     = pendingInvoices[0].customerName || "";
          deliveryLocation = deliveryLocation || pendingInvoices[0].location || "";
        }
      }

      // Try selected invoiceIds to resolve customerName + location
      if ((!customerName || !deliveryLocation) && invoiceIds.length > 0) {
        const inv = await Invoice.findById(invoiceIds[0])
          .select("customerName location").lean();
        if (inv) {
          customerName     = customerName     || inv.customerName || "";
          deliveryLocation = deliveryLocation || inv.location     || "";
        }
      }

      // Final fallback: look up any invoice for this plant
      if ((!customerName || !deliveryLocation) && d.plantReferenceNumber) {
        const inv = await Invoice.findOne({ plantReferenceNumber: d.plantReferenceNumber })
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
        invoiceIds,
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

    // On create: vehicle is Active (assigned to shipment, not yet on road)
    await Vehicle.findByIdAndUpdate(vehicleId, { availability: "Scheduled", status: "Active" });
    // Mark driver as Assigned
    await Driver.findByIdAndUpdate(driverId, { tripStatus: "Assigned", assignedVehicle: vehicle.vehicleNo });

    // Mark all linked invoices as "Assigned"
    const allInvoiceIds = destinationDocs.flatMap((d) => d.invoiceIds || []);
    if (allInvoiceIds.length > 0) {
      await Invoice.updateMany({ _id: { $in: allInvoiceIds } }, { status: "Assigned" });
    }

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
          const inv = await Invoice.findOne({ plantReferenceNumber: dest.plantReferenceNumber })
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
      .populate("destinations.invoiceIds", "invoiceNumber invoiceDate plantReferenceNumber")
      .lean();

    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
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
    const { status } = req.body;
    const allowed = ["Pending", "In Transit", "Delivered", "Cancelled", "Returned"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "Delivered" ? { deliveryDate: new Date() } : {}),
        ...(status === "In Transit" ? { dispatchDate: new Date() } : {}),
        ...(status === "Returned"   ? { deliveryDate: new Date(), arrivalTime: new Date() } : {}),
      },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    // Collect all linked invoice IDs across destinations
    // Fallback: if invoiceIds is empty for a destination, look up by plantReferenceNumber
    const linkedInvoiceIds = [];
    for (const d of shipment.destinations || []) {
      if (d.invoiceIds?.length) {
        linkedInvoiceIds.push(...d.invoiceIds);
      } else if (d.plantReferenceNumber) {
        // Legacy shipment — invoiceIds not stored; find by plant + current status
        const invs = await Invoice.find({
          plantReferenceNumber: d.plantReferenceNumber,
          status: { $in: ["Pending", "Assigned", "In Transit"] },
        }).select("_id").lean();
        linkedInvoiceIds.push(...invs.map((i) => i._id));
      }
    }

    // ── Vehicle, Driver & Invoice side-effects by status ──────────────────────
    if (status === "In Transit") {
      // Dispatched — vehicle is now physically on the road
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "On Trip", status: "In Transit" });
      // Driver is now driving
      await Driver.findByIdAndUpdate(shipment.driverId, { tripStatus: "Driving" });
      if (linkedInvoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: linkedInvoiceIds } }, { status: "In Transit" });
      }
    } else if (status === "Delivered") {
      // Shipment delivered — invoices marked Delivered, but vehicle/driver stay active
      // until the vehicle physically returns to warehouse (Returned status)
      if (linkedInvoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: linkedInvoiceIds } }, { status: "Delivered" });
      }
    } else if (status === "Returned") {
      // Vehicle back at warehouse — NOW free vehicle and driver
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "Available", status: "Idle" });
      await Driver.findByIdAndUpdate(shipment.driverId, { tripStatus: "Idle", assignedVehicle: null });
      if (linkedInvoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: linkedInvoiceIds } }, { status: "Delivered" });
      }
    } else if (status === "Cancelled") {
      // Cancelled — free vehicle and driver, reset invoices
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, { availability: "Available", status: "Idle" });
      await Driver.findByIdAndUpdate(shipment.driverId, { tripStatus: "Idle", assignedVehicle: null });
      if (linkedInvoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: linkedInvoiceIds } }, { status: "Pending" });
      }
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
    const vehicleChanged = vehicle && existing.vehicleId?.toString() !== vehicle._id.toString();
    if (vehicle) {
      if (vehicleChanged) {
        // Free old vehicle
        await Vehicle.findByIdAndUpdate(existing.vehicleId, { availability: "Available", status: "Idle" });
        // New vehicle status depends on current shipment status
        const newVehicleStatus = existing.status === "In Transit"
          ? { availability: "On Trip",   status: "In Transit" }
          : { availability: "Scheduled",  status: "Active" };
        await Vehicle.findByIdAndUpdate(vehicle._id, newVehicleStatus);
      }
      update.vehicleId         = vehicle._id;
      update.vehicleNumber     = vehicle.vehicleNo;
      update.vehicleCapacityKg = vehicle.capacityKg;
    }

    // ── Driver change ───────────────────────────────
    const driverChanged = driver && existing.driverId?.toString() !== driver._id.toString();
    if (driver) {
      // Free old driver if different
      if (driverChanged) {
        await Driver.findByIdAndUpdate(existing.driverId, { tripStatus: "Idle", assignedVehicle: null });
        await Driver.findByIdAndUpdate(driver._id, { tripStatus: "Assigned", assignedVehicle: vehicle?.vehicleNo || existing.vehicleNumber });
      }
      update.driverId    = driver._id;
      update.driverName  = driver.name;
      update.driverPhone = driver.phone;
    }

    // If vehicle changed but driver stayed the same, update the existing driver's assignedVehicle
    if (vehicleChanged && !driverChanged) {
      await Driver.findByIdAndUpdate(existing.driverId, { assignedVehicle: vehicle.vehicleNo });
    }

    // ── Status logic on update ──────────────────────
    // Editing a shipment does NOT auto-dispatch it — status only changes via PATCH /status

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
          const inv = await Invoice.findOne({ plantReferenceNumber: d.plantReferenceNumber })
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
    }

    const shipment = await Shipment.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json({ success: true, message: "Shipment updated", data: shipment });
  } catch (err) {
    console.error("Update shipment error:", err);
    res.status(500).json({ success: false, message: "Error updating shipment", error: err.message });
  }
};


export const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id).lean();
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    // ── Free driver back to Idle ──────────────────────────────────────────────
    if (shipment.driverId) {
      await Driver.findByIdAndUpdate(shipment.driverId, {
        tripStatus: "Idle",
        assignedVehicle: null,
      });
    }

    // ── Free vehicle back to Available/Idle ───────────────────────────────────
    if (shipment.vehicleId) {
      await Vehicle.findByIdAndUpdate(shipment.vehicleId, {
        availability: "Available",
        status: "Idle",
      });
    }

    // ── Reset any linked invoice statuses back to Pending ─────────────────────
    const invoiceIdsToFree = [];
    (shipment.destinations || []).forEach((d) => {
      if (d.invoiceIds?.length) invoiceIdsToFree.push(...d.invoiceIds);
    });
    if (invoiceIdsToFree.length > 0) {
      await Invoice.updateMany({ _id: { $in: invoiceIdsToFree } }, { status: "Pending" });
    }

    await Shipment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Shipment deleted and related records freed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting shipment", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   PATCH /api/shipments/:id/pod
   Update POD status (Not Generated → Pending → Submitted)
───────────────────────────────────────────────── */
export const updatePodStatus = async (req, res) => {
  try {
    const { podStatus } = req.body;
    const allowed = ["Not Generated", "Pending", "Submitted"];
    if (!allowed.includes(podStatus)) {
      return res.status(400).json({ success: false, message: "Invalid POD status" });
    }
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      { podStatus },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });
    res.status(200).json({ success: true, message: "POD status updated", data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating POD status", error: err.message });
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
      .select("invoiceNumber invoiceDate status location customerName")
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
    // Only return plants that have at least one Pending invoice
    // (Assigned / In Transit / Delivered plants are already in a shipment)
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
   PATCH /api/shipments/:id/destination/:destId/delivery
   Mark a destination in a shipment as delivered
───────────────────────────────────────────────── */
export const updateDestinationDelivery = async (req, res) => {
  try {
    const { id, destId } = req.params;
    const { receiverName, remarks } = req.body;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    const destination = shipment.destinations.id(destId);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    // Update destination delivery state
    destination.isDelivered = true;
    destination.deliveredAt = new Date();
    destination.podStatus = "Pending"; // delivery confirmed but POD not yet uploaded
    if (receiverName !== undefined) destination.podReceiverName = receiverName;
    if (remarks !== undefined) destination.podRemarks = remarks;

    // Update linked invoices to Delivered status immediately
    if (destination.invoiceIds && destination.invoiceIds.length > 0) {
      await Invoice.updateMany(
        { _id: { $in: destination.invoiceIds } },
        { status: "Delivered" }
      );
    } else if (destination.plantReferenceNumber) {
      await Invoice.updateMany(
        { plantReferenceNumber: destination.plantReferenceNumber, status: { $ne: "Delivered" } },
        { status: "Delivered" }
      );
    }

    // Check if ALL destinations are now delivered — enable "Shipment Completed" button
    // but do NOT auto-close; closure is manual via PATCH /:id/status → "Delivered"
    const allDelivered = shipment.destinations.every((d) => d.isDelivered);

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "Destination delivery confirmed",
      allDelivered,   // frontend uses this to enable the "Shipment Completed" button
      data: shipment,
    });
  } catch (err) {
    console.error("Update destination delivery error:", err);
    res.status(500).json({ success: false, message: "Error confirming delivery", error: err.message });
  }
};

/* ─────────────────────────────────────────────────
   PATCH /api/shipments/:id/destination/:destId/pod
   Submit POD documents for a specific destination
───────────────────────────────────────────────── */
export const submitDestinationPod = async (req, res) => {
  try {
    const { id, destId } = req.params;
    const { receiverName, remarks, podImages } = req.body;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    const destination = shipment.destinations.id(destId);
    if (!destination) {
      return res.status(404).json({ success: false, message: "Destination not found" });
    }

    // Save POD details — podImages are now file URLs from /api/upload (not base64)
    destination.podStatus = "Submitted";
    if (!destination.isDelivered) {
      destination.isDelivered = true;
      destination.deliveredAt = new Date();
    }
    if (podImages !== undefined && Array.isArray(podImages)) {
      destination.podImages = podImages; // store file URLs
    }
    if (receiverName !== undefined) destination.podReceiverName = receiverName;
    if (remarks !== undefined) destination.podRemarks = remarks;

    // Ensure linked invoices are marked Delivered
    if (destination.invoiceIds && destination.invoiceIds.length > 0) {
      await Invoice.updateMany(
        { _id: { $in: destination.invoiceIds } },
        { status: "Delivered" }
      );
    }

    // DO NOT auto-close shipment here — closure is manual via "Shipment Completed" button
    // The shipment stays "In Transit" until the user explicitly clicks Shipment Completed

    await shipment.save();

    res.status(200).json({
      success: true,
      message: "POD submitted successfully",
      data: shipment,
    });
  } catch (err) {
    console.error("Submit destination POD error:", err);
    res.status(500).json({ success: false, message: "Error submitting POD", error: err.message });
  }
};
