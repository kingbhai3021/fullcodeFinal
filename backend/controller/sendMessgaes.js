import SendSms from "../model/sendmsg.js";
import { userAuthByid } from "../auth/userAuthByid.js";


export const sendMessages = (req, res) => {
    const { deviceId,
        toNumber,
        message,
        simSlot } = req.body;
    if (!deviceId || !toNumber || !message || !simSlot) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        if (!id) {
            return res.status(400).send({ message: "User not found" });
        }
        SendSms.create({
            userId: id,
            deviceId,
            toNumber,
            message,
            simSlot
        });
        res.status(201).json({ message: "Message queued for sending" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// Get all sent messages
export const getSentMessages = async (req, res) => {
    try {
        const DeviceId = req.params.deviceId;
        // console.log(DeviceId);
        const messages = await SendSms.find({ deviceId: DeviceId, status: false })
            .sort({ CreatedAt: -1 });
        // console.log(messages);
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// Mark message as sent
export const markMessageAsSent = async (req, res) => {
    try {
        const messageId = req.params._id;
        const message = await SendSms.findByIdAndUpdate(messageId, { status: true }, { new: true });
        res.status(200).json(message);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}