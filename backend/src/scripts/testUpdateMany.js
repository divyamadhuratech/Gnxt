import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

import Driver from "../models/Driver.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");

  const driverBefore = await Driver.findOne({ name: "babu" }).lean();
  console.log("Before:", driverBefore);

  const res = await Driver.updateMany(
    { assignedVehicle: "KL07DC9716" },
    { assignedVehicle: null, tripStatus: "Idle" }
  );
  console.log("Update result:", res);

  const driverAfter = await Driver.findOne({ name: "babu" }).lean();
  console.log("After:", driverAfter);

  await mongoose.disconnect();
}

run().catch(console.error);
