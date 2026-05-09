
import XLSX from "xlsx";
import Invoice from "../models/invoice.model.js";
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

    // FETCH MATCHING RECORDS
    const invoices = await Invoice.find(query).sort({
      createdAt: -1,
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
          status: inv.status,
          invoices: [],
        });
      }

      groupedMap.get(key).invoices.push({
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