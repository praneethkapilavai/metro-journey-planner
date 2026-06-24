import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "Ameerpet~BR"
  name: { type: String, required: true },              // e.g. "Ameerpet"
  lines: [{ type: String }],                           // e.g. ["Blue","Red"]
  interchange: { type: Boolean, default: false },
});

export default mongoose.model("Station", stationSchema);
