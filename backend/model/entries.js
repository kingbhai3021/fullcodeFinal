import mongoose from "mongoose";

const entriesSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }, // your unique identifier
    userId: { type: mongoose.Schema.Types.ObjectId }, // or ObjectId if you need to link with users
  },
  { strict: false, timestamps: true }  // 🚀 accept any dynamic fields
);

export default mongoose.model("entries", entriesSchema);
