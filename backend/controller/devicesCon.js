import DeviceSchema from '../model/devices.js';
import { userAuthByid } from '../auth/userAuthByid.js';


// Store All Devices
export const StoreallDevices = async (req, res) => {
    try {
        const data = req.body;
        // console.log(data);
        const deviceId = data.deviceId;
        const existingDevice = await DeviceSchema.findOne({ deviceId: deviceId });
        if (existingDevice) {
            await DeviceSchema.findOneAndUpdate(
                { deviceId: deviceId },
                { $set: data },
                { new: true }
            );
            return res.status(200).json("Device updated successfully");
        } else {
            await DeviceSchema.create(data);
            return res.status(201).json("Device stored successfully");
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// access all devices 
export const AcessAllDevices = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        const data = await DeviceSchema.find({ userId: id }).sort({ lastActive: -1 });
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// Get Device by ID
export const GetDeviceById = async (req, res) => {
  try {
    const id = req.params.deviceId;

    const data = await DeviceSchema.findOne({ deviceId: id });

    if (!data) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Delete Device by ID
export const DeleteDeviceById = async (req, res) => {
    try {
        const id = req.params._id;
        await DeviceSchema.findOneAndDelete({ _id: id });
        res.status(200).json({ message: "Device Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// if Device not active for 2 minutes then make it inactive
export const DeviceInactive = async (req, res) => {
    try {
        const data = await DeviceSchema.find({ lastActive: { $lt: new Date(Date.now() - 2 * 60 * 1000) } });
        data.forEach(async (item) => {
            await DeviceSchema.findOneAndUpdate({ deviceId: item.deviceId }, { isActive: false });
        });
        // res.status(200).json({ message: "Device Inactive Successfully" });
    } catch (error) {
        console.log(error);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}