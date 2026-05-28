import Driver from "../models/Driver.js";
import Vehicle from "../models/Vehicle.js";
import Shipment from "../models/shipment.model.js";
import Invoice from "../models/invoice.model.js";

// GET all drivers
export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers", error: error.message });
  }
};

// GET driver by ID
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Error fetching driver", error: error.message });
  }
};

// CREATE new driver
export const createDriver = async (req, res) => {
  try {
    const { name, age, phone, licenseNumber, driverType, tripStatus } = req.body;

    // Validation
    if (!name || !age || !phone || !licenseNumber || !driverType) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if phone already exists
    const existingPhone = await Driver.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Check if license already exists
    const existingLicense = await Driver.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: "License number already registered" });
    }

    const newDriver = new Driver({
      name,
      age,
      phone,
      licenseNumber,
      driverType,
      tripStatus: tripStatus || "Idle",
    });

    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: "Error creating driver", error: error.message });
  }
};

// UPDATE driver
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, phone, licenseNumber, driverType, tripStatus, assignedVehicle } = req.body;

    // Check if phone already exists for another driver
    if (phone) {
      const existingPhone = await Driver.findOne({ phone, _id: { $ne: id } });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    // Check if license already exists for another driver
    if (licenseNumber) {
      const existingLicense = await Driver.findOne({ licenseNumber, _id: { $ne: id } });
      if (existingLicense) {
        return res.status(400).json({ message: "License number already in use" });
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { name, age, phone, licenseNumber, driverType, tripStatus, assignedVehicle },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ── Sync name / phone changes into active Shipment documents ───────────────
    const shipmentUpdate = {};
    if (name)  shipmentUpdate.driverName  = name;
    if (phone) shipmentUpdate.driverPhone = phone;
    if (Object.keys(shipmentUpdate).length > 0) {
      await Shipment.updateMany(
        { driverId: id, status: { $in: ["Pending", "In Transit"] } },
        shipmentUpdate
      );
    }

    res.json(updatedDriver);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    res.status(500).json({ message: "Error updating driver", error: error.message });
  }
};

// DELETE driver
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id).lean();
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ── Free the vehicle this driver was assigned to ─────────────────────────
    if (driver.assignedVehicle) {
      await Vehicle.updateMany(
        { vehicleNo: driver.assignedVehicle },
        { availability: "Available", status: "Idle" }
      );
    }

    // ── Cancel any active shipments assigned to this driver ─────────────────
    const activeShipments = await Shipment.find({
      driverId: id,
      status: { $in: ["Pending", "In Transit"] },
    }).lean();

    for (const s of activeShipments) {
      // Free the vehicle on each orphaned shipment
      if (s.vehicleId) {
        await Vehicle.findByIdAndUpdate(s.vehicleId, { availability: "Available", status: "Idle" });
      }
      // Reset linked invoices back to Pending
      const invoiceIds = (s.destinations || []).flatMap((d) => d.invoiceIds || []);
      if (invoiceIds.length > 0) {
        await Invoice.updateMany({ _id: { $in: invoiceIds } }, { status: "Pending" });
      }
      // Cancel the shipment
      await Shipment.findByIdAndUpdate(s._id, { status: "Cancelled" });
    }

    await Driver.findByIdAndDelete(id);
    res.json({ message: "Driver deleted and related records cleaned up" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting driver", error: error.message });
  }
};

// GET drivers by type
export const getDriversByType = async (req, res) => {
  try {
    const { type } = req.params;

    const drivers = await Driver.find({ driverType: type }).sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers", error: error.message });
  }
};

// GET drivers by status
export const getDriversByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const drivers = await Driver.find({ tripStatus: status }).sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drivers", error: error.message });
  }
};

// SEARCH drivers
export const searchDrivers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const drivers = await Driver.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { licenseNumber: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Error searching drivers", error: error.message });
  }
};

// UPDATE driver performance
export const updateDriverPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalTrips, completedTrips, rating } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      {
        "performance.totalTrips": totalTrips,
        "performance.completedTrips": completedTrips,
        "performance.rating": rating,
      },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: "Error updating performance", error: error.message });
  }
};

// UPDATE driver documents
export const updateDriverDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { licenseExpiry, insuranceExpiry, medicalExamExpiry } = req.body;

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      {
        documents: {
          licenseExpiry,
          insuranceExpiry,
          medicalExamExpiry,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(updatedDriver);
  } catch (error) {
    res.status(500).json({ message: "Error updating documents", error: error.message });
  }
};