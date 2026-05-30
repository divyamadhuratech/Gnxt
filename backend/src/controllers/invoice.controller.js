
import XLSX from "xlsx";
import Invoice from "../models/invoice.model.js";
import { mapExcelRowToInvoice, validateSheetColumns, resolveHeaderKeys } from "../utils/mapInvoice.js";

export const uploadInvoiceSheet = async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Validate that sheet has required columns
    const sheetHeaders = Object.keys(rows[0] || {});
    const missingColumns = validateSheetColumns(sheetHeaders);

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Sheet validation failed: Missing required column(s)",
        validationError: true,
        missingColumns,
        headers: sheetHeaders,
      });
    }

    const resolvedKeys = resolveHeaderKeys(sheetHeaders);
    const uniqueMap = new Map();

    for (const row of rows) {
      const mapped = mapExcelRowToInvoice(row, resolvedKeys);

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

// GET

export const getInvoices = async (req, res) => {
  try {
    let {
      search = "",
      status = "",
      page = 1,
      limit = 15,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // SEARCH
    if (search.trim()) {
      query.$or = [
        {
          plantReferenceNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          invoiceNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // STATUS FILTER
    if (status.trim()) {
      query.status = status;
    }

    // ACTIVE FILTER: exclude Delivered invoices that are older than 2 minutes
    // (they have moved to history)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    query.$nor = [
      {
        status: "Delivered",
        $or: [
          { deliveredAt: { $lt: twoMinutesAgo } },
          { deliveredAt: null, updatedAt: { $lt: twoMinutesAgo } },
          { deliveredAt: { $exists: false }, updatedAt: { $lt: twoMinutesAgo } }
        ]
      },
    ];

    // FETCH MATCHING RECORDS
    const invoices = await Invoice.find(query).sort({
      plantReferenceNumber: 1,
      invoiceNumber: 1
    });

    // GROUPING
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
          createdAt: inv.createdAt,
          invoices: [],
        });
      }

      groupedMap.get(key).invoices.push({
          _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        isChecked: inv.isChecked,
      });
    });

    const groupedData = Array.from(groupedMap.values());

    // PAGINATION
    const total = groupedData.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = groupedData.slice(
      startIndex,
      endIndex
    );

    res.status(200).json({
      success: true,
      data: paginatedData,
      data: paginatedData,
      pagination: {
        total,
        totalPages,
        currentPage: page,
      },
    });

  } catch (error) {

  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
  });
  }
}

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { plantId } = req.params;
    const { status } = req.body;

    // Stamp deliveredAt when status becomes Delivered
    const updateData = { status };
    if (status === "Delivered") {
      updateData.deliveredAt = new Date();
    } else {
      // Reset deliveredAt if status reverts (e.g., back to Assigned/Pending)
      updateData.deliveredAt = null;
    }

    await Invoice.updateMany(
      { plantReferenceNumber: plantId },
      updateData
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

    // Example for MongoDB
    await Invoice.findByIdAndDelete(invoiceId);

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

/* ─────────────────────────────────────────────────
   GET /api/invoices/history
   Returns Delivered invoices that have aged past 5 minutes (moved to history)
───────────────────────────────────────────────── */
export const getInvoiceHistory = async (req, res) => {
  try {
    let { search = "", page = 1, limit = 15 } = req.query;
    page  = Number(page);
    limit = Number(limit);

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const query = {
      status: "Delivered",
      $or: [
        { deliveredAt: { $lt: twoMinutesAgo } },
        { deliveredAt: null, updatedAt: { $lt: twoMinutesAgo } },
        { deliveredAt: { $exists: false }, updatedAt: { $lt: twoMinutesAgo } }
      ]
    };

    if (search.trim()) {
      query.$or = [
        { plantReferenceNumber: { $regex: search, $options: "i" } },
        { customerName:         { $regex: search, $options: "i" } },
        { invoiceNumber:        { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(query).sort({ deliveredAt: -1 });

    // Group by plant + customer (same as main list)
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
          deliveredAt: inv.deliveredAt,
          invoices: [],
        });
      }
      groupedMap.get(key).invoices.push({
        _id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        deliveredAt: inv.deliveredAt,
      });
    });

    const groupedData = Array.from(groupedMap.values());
    const total       = groupedData.length;
    const totalPages  = Math.ceil(total / limit);
    const paginated   = groupedData.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: { total, totalPages, currentPage: page },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};