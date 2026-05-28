import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    console.warn("⚠️ Database connection failed. Running server in static/offline mode.");
  }
};

export default connectDB;