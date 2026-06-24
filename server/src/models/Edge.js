import mongoose from "mongoose";

const edgeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  distance: { type: Number, required: true },
  line: { type: String, required: true }, // "Blue" | "Red" | "Green"
});

export default mongoose.model("Edge", edgeSchema);
