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


// Access Messages by User ALL messsages

export const AcessMessage = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            return res.status(400).send({ message: "Token Not Found" });
        }

        const id = userAuthByid(tokenformCookie);

        // latest first
        const allMessages = await messagesModel.find({ userId: id }).sort({ CreateAt: -1 });

        res.status(200).json({ allMessages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




// Access Messages  by DeviceId

export const AcessMessageByDeviceId = async (req, res) => {
    try {
        const id = req.params.DeviceId;
        const allMessages = await messagesModel.find({ deviceId: id });
        res.status(200).json({ allMessages });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



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