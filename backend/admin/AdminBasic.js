import logins from "../model/logins.js";
import mongoose from "mongoose";
import messages from "../model/messages.js";
import devices from "../model/devices.js";
import entries from "../model/entries.js";
import e from "express";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";

//Login Admin
export const AdminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ username: username }, process.env.SECRET_KEY_ADMIN, { expiresIn: "1d" });
            res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
            res.status(200).json({ message: "Login successful" });
            
        }else{
            res.status(401).json({ message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
// Create a user
export const CreateUser = async (req, res) => {
    try {
        const { username, password, ValidUpto } = req.body;
        // const DynamicModel = mongoose.model(username, new mongoose.Schema({}, { strict: false }));
        const UserExist = await logins.findOne({ username });
        if (UserExist) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const user = await logins.create({ username, password, ValidUpto });
        if (user) {
            res.status(201).json({ message: 'User created successfully' });
        } else {
            res.status(500).json({ error: 'Failed to create user' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


// Get all users
export const GetAllUsers = async (req, res) => {
    try {
        const users = await logins.find();
        // For each user, get their totalMessages, TotalDevices, totalData
        const usersWithCounts = await Promise.all(users.map(async (user) => {
            const totalMessages = await messages.countDocuments({ userId: user._id });
            const TotalDevices = await devices.countDocuments({ userId: user._id });
            const totalData = await entries.countDocuments({ userId: user._id });
            return {
                ...user.toObject(),
                totalMessages,
                TotalDevices,
                totalData
            };
        }));
        res.status(200).json({ users: usersWithCounts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Delete user by ID
export const DeleteUserById = async (req, res) => {
    try {
        const id = req.params._id;
        await logins.findOneAndDelete({ _id: id });
        res.status(200).json({ message: "User Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Update user by ID
export const UpdateUserById = async (req, res) => {
    try {
        const id = req.params._id;
        const { username, password, ValidUpto } = req.body;

        const user = await logins.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.username = username || user.username;
        user.password = password || user.password;
        user.ValidUpto = ValidUpto || user.ValidUpto;

        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// Get user by ID
export const GetUserById = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await logins.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalMessages = await messages.countDocuments({ userId: user._id });
        const TotalDevices = await devices.countDocuments({ userId: user._id });
        const totalData = await entries.countDocuments({ userId: user._id });
        res.status(200).json({
            ...user.toObject(),
            totalMessages,
            TotalDevices,
            totalData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// toatal messages of user
export const TotalMessagesOfUser = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await logins.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const totalMessages = await messages.countDocuments({ userId: user._id });
        const TotalDevices = await devices.countDocuments({ userId: user._id });
        const totalData = await entries.countDocuments({ userId: user._id });

        res.status(200).json({ totalMessages: totalMessages, TotalDevices: TotalDevices, totalData: totalData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// delete all messages 
export const DeleteAllMessagesOfUser = async (req, res) => {
    try {
        const id = req.params._id;
        const user = await logins.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await messages.deleteMany({ userId: user._id });
        res.status(200).json({ message: "All Messages, Devices and Data Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}