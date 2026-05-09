import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    plantReferenceNumber: {  // Plant Reference Number
      type: String,
      required: true,
      trim: true,
    },
    customerName: {  // Customer Name
      type: String,
      required: true,
      trim: true,
    },
    invoiceNumber: {  // Invoice
      type: String,
      required: true,
      trim: true,
    },
    invoiceDate: {  // Invoice Date
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["In Transit", "Pending", "Delivered"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

// COMPOSITE UNIQUE INDEX on all 4 fields
invoiceSchema.index(
  { 
    plantReferenceNumber: 1, 
    customerName: 1, 
    invoiceNumber: 1, 
    invoiceDate: 1 
  }, 
  { unique: true }
);

export default mongoose.model("Invoice", invoiceSchema);