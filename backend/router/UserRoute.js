import express from 'express';
import { login } from '../controller/loginController.js';
import { Updatephonenumber, GetPhonenumber, GetPhonenumberInApp } from '../controller/updatePhonenumber.js';
import { StoreData, AccessData, DeleteDataById, AccessDataByid } from '../controller/dataController.js';
import { StoreallDevices, AcessAllDevices, DeleteDeviceById, GetDeviceById, DeviceInactive } from '../controller/devicesCon.js';
import { messages, AcessMessage, AcessMessageByDeviceId, DeleteAllMessages, DeleteAllMessagesByDeviceId} from '../controller/MessagesCon.js';
import { dashboard, changePassword } from '../controller/dashboard.js';
import { usersMiddleware } from '../middleware/usersMiddleware.js';
import { sendMessages, markMessageAsSent, getSentMessages } from '../controller/sendMessgaes.js';

const Loginroute = express.Router();

// Login Route
Loginroute.post("/login", login);

// Update phone number route
Loginroute.post("/updatePhoneNumber", usersMiddleware, Updatephonenumber);

// Access Phone Number
Loginroute.get("/getPhoneNumber", GetPhonenumber);

Loginroute.get("/getphone/:userId", GetPhonenumberInApp);


// StoreData From user
Loginroute.post("/storeData", StoreData);
// Access Data 
Loginroute.get("/getData", usersMiddleware, AccessData);

Loginroute.get("/getDataBy/:deviceId", usersMiddleware, AccessDataByid);

// Delete Data by ID
Loginroute.delete("/deleteData/:_id", usersMiddleware, DeleteDataById);

// Store Devices 
Loginroute.post("/storeDevices", StoreallDevices);

// Access All Devices
Loginroute.get("/getAllDevices", usersMiddleware, AcessAllDevices);

// Access Device by ID
Loginroute.get("/getDevice/:deviceId", usersMiddleware, GetDeviceById);
// Delete device by ID
Loginroute.delete("/deleteDevice/:_id", usersMiddleware, DeleteDeviceById);



// dashboard 
Loginroute.get("/dashboard", usersMiddleware, dashboard);


// Change Password
Loginroute.post("/chnagepassword", usersMiddleware, changePassword);


// Store Messages
Loginroute.post("/StoreMessages", messages);
// Access messages 
Loginroute.get("/getMessages", usersMiddleware, AcessMessage);
// Access messages by Id
Loginroute.get("/getMessages/:DeviceId", usersMiddleware, AcessMessageByDeviceId);
// delete all messages
Loginroute.delete("/deleteAllMessages", usersMiddleware, DeleteAllMessages);
// delete all messages by DeviceId
Loginroute.delete("/deleteAllMessages/:DeviceId", usersMiddleware, DeleteAllMessagesByDeviceId);
// Msg count
// Loginroute.get("/getCountsOfMsg", usersMiddleware, getCountsOfMsg);



// Send message 
Loginroute.post("/sendsms", usersMiddleware, sendMessages);
// access send message on device
Loginroute.get("/getsms/:deviceId", getSentMessages);

// MArk message as sent through device
Loginroute.post("/markMessageAsSent/:_id", markMessageAsSent);


setInterval(DeviceInactive, 1 * 60 * 1000);

export default Loginroute;