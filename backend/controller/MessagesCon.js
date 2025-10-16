import { userAuthByid } from "../auth/userAuthByid.js";
import messagesModel from "../model/messages.js";



// store messages
export const messages = async (req, res) => {
    const data = req.body;
    // console.log(data);
    try {
        await messagesModel.create(data);
        res.status(200).json({ message: "Message stored successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Access Messages by User - Keep only latest 2000
export const AcessMessage = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            return res.status(400).send({ message: "Token Not Found" });
        }

        const id = userAuthByid(tokenformCookie);

        // Fetch the latest 2000 messages only
        const allMessages = await messagesModel
            .find({ userId: id })
            .sort({ CreateAt: -1 })
            .limit(2000);

        // Delete older messages (keep only the latest 2000)
        const totalMessagesCount = await messagesModel.countDocuments({ userId: id });
        if (totalMessagesCount > 2000) {
            // Find the cutoff message's createdAt value
            const cutoffMessage = allMessages[allMessages.length - 1];
            await messagesModel.deleteMany({
                userId: id,
                CreateAt: { $lt: cutoffMessage.CreateAt },
            });
        }

        res.status(200).json({ allMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Access Messages by DeviceId - Keep only latest 2000
export const AcessMessageByDeviceId = async (req, res) => {
    try {
        const id = req.params.DeviceId;

        // Fetch the latest 2000 messages only
        const allMessages = await messagesModel
            .find({ deviceId: id })
            .sort({ CreateAt: -1 })
            .limit(2000);

        // Delete older messages beyond 2000
        const totalMessagesCount = await messagesModel.countDocuments({ deviceId: id });
        if (totalMessagesCount > 2000) {
            const cutoffMessage = allMessages[allMessages.length - 1];
            await messagesModel.deleteMany({
                deviceId: id,
                CreateAt: { $lt: cutoffMessage.CreateAt },
            });
        }

        res.status(200).json({ allMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Delete all messages
export const DeleteAllMessages = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            return res.status(400).send({ message: "Token Not Found" });
        }

        const id = userAuthByid(tokenformCookie);
        await messagesModel.deleteMany({ userId: id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Delete all messages by DeviceId
export const DeleteAllMessagesByDeviceId = async (req, res) => {
    try {
        const deviceId = req.params.DeviceId;
        await messagesModel.deleteMany({ deviceId: deviceId });
        res.status(200).json({ message: "All messages deleted successfully for the device" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}