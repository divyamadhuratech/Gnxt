
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    // currentLoadKg: {
    //   type: Number,
    //   default: 0,
    //   min: 0,
    // },
    // driver: {
    //   id: String,
    //   name: String,
    // },
    status: {
      type: String,
      default: "Idle",
      enum: ["Active", "In Transit", "Idle", "Maintenance"],
    },
    // location: {
    //   type: String,
    //   default: "Pune Depot",
    // },
    insuranceExpiry: {
      type: Date,
      required: true,
    },
    availability: {
      type: String,
      default: "Available",
      enum: ["Available", "On Trip", "Scheduled", "Unavailable"],
    },
    ownership: {
      type: String,
      required: true,
      enum: ["Company", "Leased", "Rented"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vehicle", vehicleSchema);
