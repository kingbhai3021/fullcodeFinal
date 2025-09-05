import entries from "../model/entries.js";
import { userAuthByid } from "../auth/userAuthByid.js";
import devices from "../model/devices.js";
import messages from "../model/messages.js";
import logins from "../model/logins.js";


export const dashboard = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        const data = await entries.find({ userId: id })
        const toataldata = data.length;
        const totaldevices = await devices.find({ userId: id })
        const totalmessages = await messages.find({ userId: id })
        res.status(200).json({ toataldata, totaldevices: totaldevices.length, totalmessages: totalmessages.length });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });

    }


}


export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        const user = await logins.findOneAndUpdate(
            { _id: id, password: oldPassword },
            { $set: { password: newPassword } }
        );
        if (!user) {
            return res.status(400).send({ message: "Old password is incorrect" });
        }
        res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });

    }
}