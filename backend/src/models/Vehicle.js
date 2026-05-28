
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      unique: true,
    },
    vehicleNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Truck", "Mini Truck", "Trailer", "Container", "Tanker"],
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    capacityKg: {
      type: Number,
      required: true,
      min: 0,
    },
   
    status: {
      type: String,
      default: "Idle",
      enum: ["Active", "In Transit", "Idle", "Maintenance"],
    },
   
    insuranceExpiry: {
      type: Date,
      required: true,
    },
    availability: {
      type: String,
      default: "Available",
      enum: ["Available", "Assigned", "On Trip", "Scheduled", "Unavailable"],
    },
    ownership: {
      type: String,
      required: true,
      enum: ["Company", "Leased", "Rented"],
    },
    gpsImei: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vehicle", vehicleSchema);
