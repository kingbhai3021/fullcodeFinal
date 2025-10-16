import entries from "../model/entries.js";
import { userAuthByid } from "../auth/userAuthByid.js";


// Store the data in the database
export const StoreData = async (req, res) => {
    const data = req.body;
    // console.log(data);
    try {
        if (!data.id) {
            return res.status(400).json({ error: "id field is required" });
        }
        const oldData = await entries.findOne({ id: data.id });

        if (oldData) {
            await entries.findOneAndUpdate(
                { id: data.id },
                { $set: data },
                { new: true }
            );
            return res.status(200).json({ message: "Updated successfully" });

        } else {
            await entries.create(data);
            return res.status(200).json({ message: "Created successfully" });
        }

    } catch (error) {
        console.error("StoreData Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Access the data from the database
export const AccessData = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        const DataById = await entries.find({ userId: id }).sort({ createdAt: -1 });
        // console.log(DataById);
        res.status(201).json(DataById)

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


// Delete Perticular Data by ID
export const DeleteDataById = async (req, res) => {
    try {
        const id = req.params._id;
        await entries.findOneAndDelete({ _id: id });
        res.status(200).json({ message: "Data Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const AccessDataByid = async (req, res) => {
    try {
        const id = req.params.deviceId;
        // console.log(id);
        if (!id) {
            res.status(400).send({ message: "Device Id Not Found" });
        }
        const data = await entries.find({ deviceId: id });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}