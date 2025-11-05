import mongoose from "mongoose";

const message = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    deviceId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    sim_number: {
        type: String,
        required: true
    },
    sim_slot: {
        type: String,
        required: true
    },
    CreateAt: {
        type: Date,
        default: Date.now
    },
    msgcount: {
        type: Number,
        default:0
    }
})

export default mongoose.model("Messages", message)