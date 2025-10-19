import mongoose from "mongoose";

const SendSMS = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    deviceId: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    toNumber: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    simSlot: {
        type: String,
        required: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
})

const SendSms = mongoose.model('SendSms', SendSMS);
export default SendSms;