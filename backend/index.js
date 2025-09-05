
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from "cors";

import connectDB from './config/db.js';
import Loginroute from './router/UserRoute.js';
import AdminRoute from './router/AdminRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api', Loginroute);
app.use('/api', AdminRoute);



app.use(express.json());

// Connect to DB and start server
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

startServer();
