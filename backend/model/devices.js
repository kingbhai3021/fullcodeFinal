import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },

    // Permanent IDs
    deviceId: { type: String, required: true, unique: true }, // Android_ID
    manufacturer: String,
    model: String,
    brand: String,
    osVersion: String,
    sdkVersion: String,

    // SIM & Network
    carrierName: String,
    simSlotCount: Number,
    networkType: String,
    phoneNumber: String,
    slot1Number: String,
    slot2Number: String,

    // Battery & Hardware
    batteryLevel: Number,
    // Status
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
    
});

export default mongoose.model("Devices", DeviceSchema);
