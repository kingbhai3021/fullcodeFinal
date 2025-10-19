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

// Allow all origins (not recommended for production)
const allowedOrigins = [
  "http://localhost:3000",
  "https://srv1049098.hstgr.cloud"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/api', Loginroute);
app.use('/api', AdminRoute);

// Connect to DB and start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
