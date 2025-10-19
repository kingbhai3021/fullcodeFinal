import { db } from "../config/firebaseConfig.js";
import { userAuthByid } from "../auth/userAuthByid.js";

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
      simSlot,
      status: false,
      createdAt: new Date(),
    };

    await db.collection("sendSms").add(newMessage);

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
    const messagesRef = db
      .collection("sendSms")
      .where("deviceId", "==", deviceId)
      .where("status", "==", false)
      .orderBy("createdAt", "desc");

    const snapshot = await messagesRef.get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const messages = snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));

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

    const messageRef = db.collection("sendSms").doc(messageId);
    await messageRef.update({ status: true });

    const updatedDoc = await messageRef.get();

    res.status(200).json({
      _id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
