
import { userAuthByid } from "../auth/userAuthByid.js";
import sendmsg from "../model/sendmsg.js";

export const sendMessages = async (req, res) => {
  const { deviceId, toNumber, message, simSlot } = req.body;

  if (!deviceId || !toNumber || !message || !simSlot) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const tokenformCookie = req.cookies.token;
    if (!tokenformCookie) {
      return res.status(400).json({ message: "Token Not Found" });
    }

    const id = userAuthByid(tokenformCookie);
    if (!id) {
      return res.status(400).json({ message: "User not found" });
    }

    const newMessage = {
      userId: id,
      deviceId,
      toNumber,
      message,
      simSlot
    };

    await sendmsg.create(newMessage);

    res.status(201).json({ message: "Message queued for sending" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all unsent messages for a device
export const getSentMessages = async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const messages = await sendmsg.find({ deviceId: deviceId, status: false });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Mark a message as sent
export const markMessageAsSent = async (req, res) => {
  try {
    const messageId = req.params._id;
    await sendmsg.findOneAndDelete({ _id: messageId });

    res.status(200).json({ message: "Message marked as sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
