import dotenv from "dotenv";
dotenv.config();
console.log("VALUE BEFORE IMPORT:", process.env.CLOUDINARY_CLOUD_NAME);
import express from "express";
import cloudinary from "./lib/cloudinary.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./database/db.js";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import { app, server } from "./lib/socket.js";

const port = process.env.PORT || 5000;

app.use(express.json({limit : "5MB"}));
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173", credentials: true}))

app.use('/api/auth',authRoutes);
app.use('/api/messages',messageRoutes);

server.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
  connectDB();
});