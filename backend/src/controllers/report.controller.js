import Shipment from "../models/shipment.model.js";
import Vehicle  from "../models/Vehicle.js";
import Driver   from "../models/Driver.js";

/**
 * GET /api/reports/stats
 * Aggregates shipment statistics based on filters.
 */
export const getShipmentStats = async (req, res) => {
  try {
    const { dateRange, vehicle, driver, dealer } = req.query;

    const query = {};

    // ── Date Range Filter ─────────────────────────────
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      if (dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "7d") {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === "30d") {
        startDate.setDate(now.getDate() - 30);
      } else if (dateRange === "90d") {
        startDate.setDate(now.getDate() - 90);
      }

      query.dispatchDate = { $gte: startDate };
    }

    // ── Vehicle Filter ────────────────────────────────
    if (vehicle && vehicle !== "all") {
      query.vehicleNumber = vehicle;
    }

    // ── Driver Filter ─────────────────────────────────
    if (driver && driver !== "all") {
      query.driverName = driver;
    }

    // ── Dealer (Customer) Filter ──────────────────────
    if (dealer && dealer !== "all") {
      query["destinations.customerName"] = dealer;
    }

    // ── Execute Aggregation ───────────────────────────
    const [total, active, completed] = await Promise.all([
      Shipment.countDocuments(query),
      Shipment.countDocuments({ ...query, status: "In Transit" }),
      Shipment.countDocuments({ ...query, status: "Delivered" }),
    ]);

    // Trend calculation (Dummy logic for now, could be improved by comparing with previous period)
    const stats = {
      total: { value: total, trend: "+12%", up: true },
      active: { value: active, trend: "+5%", up: true },
      completed: { value: completed, trend: "+8%", up: true },
    };

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching stats", error: err.message });
  }
};

/**
 * GET /api/reports/filters
 * Fetches unique values for filter dropdowns.
 */
export const getFilterOptions = async (req, res) => {
  try {
    const [vehicles, drivers, dealers] = await Promise.all([
      Shipment.distinct("vehicleNumber"),
      Shipment.distinct("driverName"),
      Shipment.distinct("destinations.customerName"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        vehicles: vehicles.sort(),
        drivers:  drivers.sort(),
        dealers:  dealers.sort(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching filters", error: err.message });
  }
};
