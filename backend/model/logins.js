import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user"
    },
    ValidUpto: {
        type: Date,
        required: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now()
    },
    UpdatedAt: {
        type: Date,
        default: Date.now()
    },
    phonenumber: {
        type: Number,
    },
    childSchema: {
        type: String
    }
})


export default mongoose.model("login", loginSchema);