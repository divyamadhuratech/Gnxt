
import XLSX from "xlsx";
import Invoice from "../models/invoice.model.js";
import Shipment from "../models/shipment.model.js";
import { mapExcelRowToInvoice } from "../utils/mapInvoice.js";

export const uploadInvoiceSheet = async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const uniqueMap = new Map();

    for (const row of rows) {
      const mapped = mapExcelRowToInvoice(row);

      if (!mapped.plantReferenceNumber) continue;

      const key = `${mapped.plantReferenceNumber}_${mapped.customerName}_${mapped.invoiceNumber}_${mapped.invoiceDate}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, mapped);
      }
    }

    const cleanData = Array.from(uniqueMap.values());

    let insertedCount = 0;

try {

  const inserted = await Invoice.insertMany(cleanData, {
    ordered: false,
  });

  insertedCount = inserted.length;

} catch (error) {

  // Ignore duplicate errors
  if (error.writeErrors) {

    insertedCount =
      error.result?.result?.nInserted || 0;

  } else {
    throw error;
  }
}

res.json({
  success: true,
  data: {
    invoicesAdded: insertedCount,
    skippedRows: cleanData.length - insertedCount,
    uniquePlants: new Set(
      cleanData.map(i => i.plantReferenceNumber)
    ).size,
  },
});


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    let {
      search = "",
      status = "",
      page   = 1,
      limit  = 15,
      history = "false",
    } = req.query;

    page  = Number(page);
    limit = Number(limit);
    const isHistory = history === "true";

    // ── Find invoice IDs still linked to open (non-closed) shipments ──────────
    // "Open" = Pending or In Transit — these invoices should stay in main view
    // even if their status is Delivered (delivery confirmed but shipment not closed)
    const openShipments = await Shipment.find({
      status: { $in: ["Pending", "In Transit"] },
    }).select("destinations.invoiceIds").lean();

    const openInvoiceIdSet = new Set(
      openShipments
        .flatMap((s) => (s.destinations || []).flatMap((d) => d.invoiceIds || []))
        .map((id) => id.toString())
    );

    // ── Build query using $and so search + status don't conflict ─────────────
    const andClauses = [];

    // Search clause
    if (search.trim()) {
      andClauses.push({
        $or: [
          { plantReferenceNumber: { $regex: search, $options: "i" } },
          { customerName:         { $regex: search, $options: "i" } },
          { invoiceNumber:        { $regex: search, $options: "i" } },
        ],
      });
    }

    if (isHistory) {
      // History = Delivered invoices whose shipment is CLOSED (not in any open shipment)
      andClauses.push({ status: "Delivered" });
      if (openInvoiceIdSet.size > 0) {
        andClauses.push({ _id: { $nin: Array.from(openInvoiceIdSet) } });
      }
    } else {
      // Main view = everything except Delivered-and-closed
      if (status.trim() === "Delivered") {
        // Explicit "Delivered" filter — show only Delivered invoices still in open shipments
        andClauses.push({ status: "Delivered" });
        if (openInvoiceIdSet.size > 0) {
          andClauses.push({ _id: { $in: Array.from(openInvoiceIdSet) } });
        } else {
          andClauses.push({ _id: { $in: [] } }); // nothing to show
        }
      } else if (status.trim() && status !== "Delivered") {
        // Specific non-Delivered status filter (Pending / Assigned / In Transit)
        andClauses.push({ status });
      } else {
        // Default: exclude invoices that are Delivered AND not in any open shipment
        if (openInvoiceIdSet.size > 0) {
          andClauses.push({
            $or: [
              { status: { $ne: "Delivered" } },
              { _id: { $in: Array.from(openInvoiceIdSet) } },
            ],
          });
        } else {
          andClauses.push({ status: { $ne: "Delivered" } });
        }
      }
    }

    const query = andClauses.length > 0 ? { $and: andClauses } : {};

    // ── Fetch & group ─────────────────────────────────────────────────────────
    const invoices = await Invoice.find(query).sort({ createdAt: -1 });

    const STATUS_PRIORITY = { Pending: 0, Assigned: 1, "In Transit": 2, Delivered: 3 };

    const groupedMap = new Map();

    invoices.forEach((inv) => {
      const key = `${inv.plantReferenceNumber}_${inv.customerName}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          _id: inv._id,
          plantNumber: inv.plantReferenceNumber,
          customerName: inv.customerName,
          location: inv.location || "",
          status: inv.status,
          invoices: [],
        });
      }

      const group = groupedMap.get(key);

      // Promote group status to the most advanced invoice status in the group
      const currentPriority = STATUS_PRIORITY[group.status] ?? 0;
      const newPriority      = STATUS_PRIORITY[inv.status]   ?? 0;
      if (newPriority > currentPriority) {
        group.status = inv.status;
      }

      group.invoices.push({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate:   inv.invoiceDate,
        status:        inv.status,
        isChecked:     inv.isChecked,
      });
    });

    const groupedData   = Array.from(groupedMap.values());
    const total         = groupedData.length;
    const totalPages    = Math.ceil(total / limit) || 1;
    const paginatedData = groupedData.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      data: paginatedData,
      pagination: { total, totalPages, currentPage: page },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { status } = req.body;

    await Invoice.updateMany(
      { _id: plantId },
      { status }
    );

    res.json({
      success: true,
      message: "Status updated",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleInvoiceCheck = async (req, res) => {
  try {
    const { plantId, invoiceNumber } = req.params;

    const invoice = await Invoice.findOne({
      _id: plantId,
      invoiceNumber,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    invoice.isChecked = !invoice.isChecked;

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    await Invoice.findByIdAndDelete(invoiceId);

    // Remove this invoice from any shipment destination that references it
    await Shipment.updateMany(
      { "destinations.invoiceIds": invoiceId },
      { $pull: { "destinations.$[].invoiceIds": invoiceId } }
    );

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete invoice error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
    });
  }
};

export const getInvoicesByPlant = async (req, res) => {
  try {
    const { plantNumber } = req.params;

    const invoices = await Invoice.find({
      plantNumber,
    }).sort({ invoiceDate: -1 });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};