import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Shipment from "../models/shipment.model.js";
import Invoice from "../models/invoice.model.js";

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error: error.message });
  }
};

// Get single vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle", error: error.message });
  }
};

// Create new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { vehicleNo, type, model, capacityKg, insuranceExpiry, ownership, gpsImei } = req.body;

    // Validation
    if (!vehicleNo || !type || !model || !capacityKg || !insuranceExpiry || !ownership) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNo });
    if (existingVehicle) {
      return res.status(409).json({ message: "Vehicle number already exists" });
    }

    // Find latest vehicle
const lastVehicle = await Vehicle.findOne().sort({ createdAt: -1 });

let nextNumber = 1;

if (lastVehicle && lastVehicle.vehicleId) {
  const lastNumber = parseInt(
    lastVehicle.vehicleId.split("-")[1]
  );

  nextNumber = lastNumber + 1;
}

// Generate VEH-001
const vehicleId = `VEH-${String(nextNumber).padStart(3, "0")}`;

console.log(`${vehicleId} vechicle id `);


    // Create new vehicle with default values
    const newVehicle = new Vehicle({
      vehicleId,
      vehicleNo,
      type,
      model,
      capacityKg: Number(capacityKg),
      insuranceExpiry: new Date(insuranceExpiry),
      ownership,
      gpsImei: gpsImei || "",
      status: "Idle",
      availability: "Available",
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Error creating vehicle", error: error.message });
  }
};

// Update vehicle (full update)
// export const updateVehicle = async (req, res) => {
//   try {
//     const { vehicleNo, type, model, capacityKg, insuranceExpiry, ownership, status, availability } = req.body;

//     // Find vehicle
//     const vehicle = await Vehicle.findById(req.params.id);
//     if (!vehicle) {
//       return res.status(404).json({ message: "Vehicle not found" });
//     }

//     // Check if new vehicle number already exists (if being changed)
//     if (vehicleNo && vehicleNo !== vehicle.vehicleNo) {
//       const existingVehicle = await Vehicle.findOne({ vehicleNo });
//       if (existingVehicle) {
//         return res.status(409).json({ message: "Vehicle number already exists" });
//       }
//     }

//     // Update fields
//     if (vehicleNo) vehicle.vehicleNo = vehicleNo;
//     if (type) vehicle.type = type;
//     if (model) vehicle.model = model;
//     if (capacityKg) vehicle.capacityKg = Number(capacityKg);
//     if (insuranceExpiry) vehicle.insuranceExpiry = new Date(insuranceExpiry);
//     if (ownership) vehicle.ownership = ownership;
//     if (status) vehicle.status = status;
//     if (availability) vehicle.availability = availability;

//     const updatedVehicle = await vehicle.save();
//     res.status(200).json(updatedVehicle);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating vehicle", error: error.message });
//   }
// };

export const updateVehicle = async (req, res) => {
  try {
    const { vehicleNo, type, model, capacityKg, insuranceExpiry, ownership, status, availability, gpsImei } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const oldVehicleNo = vehicle.vehicleNo;

    // Check if new vehicle number already exists (if being changed)
    if (vehicleNo && vehicleNo !== oldVehicleNo) {
      const existingVehicle = await Vehicle.findOne({ vehicleNo });
      if (existingVehicle) {
        return res.status(409).json({ message: "Vehicle number already exists" });
      }
    }

    if (status || availability) {
      const isChangingToInactive =
        (status && ["Idle", "Maintenance", "Breakdown"].includes(status)) ||
        (availability && ["Available", "Unavailable"].includes(availability));

      if (isChangingToInactive) {
        const activeShipment = await Shipment.findOne({
          vehicleId: vehicle._id,
          status: { $in: ["Pending", "In Transit", "Delivered"] }
        });
        if (activeShipment) {
          return res.status(400).json({
            message: `Cannot change status/availability to ${status || availability} while the vehicle is assigned to an active trip (Shipment: ${activeShipment.shipmentId}).`
          });
        }
      }
    }

    // Update fields
    if (vehicleNo) vehicle.vehicleNo = vehicleNo;
    if (type) vehicle.type = type;
    if (model) vehicle.model = model;
    if (capacityKg) vehicle.capacityKg = Number(capacityKg);
    if (insuranceExpiry) vehicle.insuranceExpiry = new Date(insuranceExpiry);
    if (ownership) vehicle.ownership = ownership;
    if (status) {
      vehicle.status = status;
      if (status === "Maintenance" || status === "Breakdown") {
        vehicle.availability = "Unavailable";
      } else if (status === "Idle") {
        vehicle.availability = "Available";
      }
    }
    if (availability && !status) vehicle.availability = availability;
    if (gpsImei !== undefined) vehicle.gpsImei = gpsImei;

    const updatedVehicle = await vehicle.save();

    // ── Sync plate number change across Shipments & Drivers ────────────────────
    if (vehicleNo && vehicleNo !== oldVehicleNo) {
      await Shipment.updateMany(
        { vehicleId: vehicle._id },
        { vehicleNumber: vehicleNo }
      );
      await Driver.updateMany(
        { assignedVehicle: oldVehicleNo },
        { assignedVehicle: vehicleNo }
      );
    }

    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle", error: error.message });
  }
};

// Update vehicle status only (for maintenance toggle)
// export const updateVehicleStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({ message: "Status is required" });
//     }

//     const vehicle = await Vehicle.findById(req.params.id);
//     if (!vehicle) {
//       return res.status(404).json({ message: "Vehicle not found" });
//     }

//     vehicle.status = status;
//     const updatedVehicle = await vehicle.save();
//     res.status(200).json(updatedVehicle);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating vehicle status", error: error.message });
//   }
// };

export const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (["Idle", "Maintenance", "Breakdown"].includes(status)) {
      const activeShipment = await Shipment.findOne({
        vehicleId: id,
        status: { $in: ["Pending", "In Transit", "Delivered"] }
      });
      if (activeShipment) {
        return res.status(400).json({
          message: `Cannot change status to ${status} while the vehicle is assigned to an active trip (Shipment: ${activeShipment.shipmentId}).`
        });
      }
    }

    const updateData = { status };
    
    if (status === "Maintenance" || status === "Breakdown") {
      updateData.availability = "Unavailable";
    } else if (status === "Idle") {
      updateData.availability = "Available";
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle status", error: error.message });
  }
};



// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // ── Reset any driver who was assigned this vehicle ───────────────────────
    await Driver.updateMany(
      { assignedVehicle: vehicle.vehicleNo },
      { assignedVehicle: null, tripStatus: "Idle" }
    );

    // ── Cancel any active shipments using this vehicle ──────────────────────
    const activeShipments = await Shipment.find({
      vehicleId: vehicle._id,
      status: { $in: ["Pending", "In Transit"] },
    }).lean();

    for (const s of activeShipments) {
      // Free the driver on each orphaned shipment
      if (s.driverId) {
        await Driver.findByIdAndUpdate(s.driverId, { tripStatus: "Idle", assignedVehicle: null });
      }
      // Reset linked invoices
      const invoiceIds = (s.destinations || []).flatMap((d) => d.invoiceIds || []);
      if (invoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: invoiceIds } }, { status: "Pending" });
      }
      // Cancel the shipment
      await Shipment.findByIdAndUpdate(s._id, { status: "Cancelled" });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vehicle deleted and related records cleaned up" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle", error: error.message });
  }
};

// Get fleet statistics
export const getFleetStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({
      status: { $in: ["Active", "In Transit"] }
    });
    const idleVehicles = await Vehicle.countDocuments({ status: "Idle" });
    const maintenanceVehicles = await Vehicle.countDocuments({
      status: { $in: ["Maintenance", "Breakdown"] }
    });

    res.status(200).json({
      total: totalVehicles,
      active: activeVehicles,
      idle: idleVehicles,
      maintenance: maintenanceVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// Search vehicles
export const searchVehicles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const vehicles = await Vehicle.find({
      $or: [
        { vehicleNo: { $regex: q, $options: "i" } },
        { model: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error searching vehicles", error: error.message });
  }
};

// Filter vehicles
export const filterVehicles = async (req, res) => {
  try {
    const { type, status, availability } = req.query;

    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (status && status !== "all") filter.status = status;
    if (availability && availability !== "all") filter.availability = availability;

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error filtering vehicles", error: error.message });
  }
};
