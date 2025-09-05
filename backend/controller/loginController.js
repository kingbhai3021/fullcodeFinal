import logins from "../model/logins.js";
import jwt from "jsonwebtoken";

// Login controller
export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(401).json({ message: "Invalid credentials" })

    }
    const user = await logins.findOne({ username: username, password: password });
    if (!user) {
        res.status(401).json({ message: "Invalid credentials" })
    } else {
        if (new Date(user.ValidUpto) < new Date()) {
            return res.status(403).json({ message: "User subscription has expired" });
        } else {
            const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY_USER, { expiresIn: "1h" });
            res.cookie("token", token, { httpOnly: false, secure: false, maxAge: 3600000 });
            res.status(200).json({ message: "Login successful", Role: user.role });
        }

    }
}