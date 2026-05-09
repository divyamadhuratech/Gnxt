export const mapExcelRowToInvoice = (row) => {
  // normalize keys (remove extra spaces)
  const cleanRow = {};
  for (let key in row) {
    cleanRow[key.trim()] = row[key];
  }

  const getValue = (keys) => {
    for (let k of keys) {
      if (cleanRow[k] !== undefined && cleanRow[k] !== null) {
        return cleanRow[k];
      }
    }
    return "";
  };

 const normalizeDate = (excelDate) => {
  // Excel serial number support
  if (typeof excelDate === "number") {
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    jsDate.setHours(0, 0, 0, 0);
    return jsDate;
  }

  const d = new Date(excelDate);

  if (isNaN(d.getTime())) return null;

  d.setHours(0, 0, 0, 0);

  return d;
};

  return {
    plantReferenceNumber: String(
      getValue(["Plant Reference Number", "Plant No", "Plant"])
    ).trim(),

    customerName: String(
      getValue(["Customer Name", "Customer"])
    ).trim(),

    invoiceNumber: String(
      getValue(["Invoice", "Invoice Number", "Invoice #"])
    ).trim(),

    invoiceDate: normalizeDate(
      getValue(["Invoice Date", "Date"])
    ),
  };
};