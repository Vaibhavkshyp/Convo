import Message from "../models/message.model.js";
import cloudinary from './../lib/cloudinary.js';
import User from '../models/user.model.js';
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getAllContacts = async (req,res) => {
    try {
        const myId = req.user._id;
        const contactUsers = await User.find({_id: {$ne : myId}}).select("-password");
        res.status(200).json(contactUsers);

    } catch (error) {
        console.log("Error in getAllContacts Controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const getMessagesByUserId = async (req,res) => {
    const myId = req.user._id;
    const {id} = req.params;
    try {
        const messages = await Message.find({
          $or: [
            { senderId: myId, recieverId: id },
            { senderId: id, recieverId: myId },
          ],
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessagesByUserId Controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req,res) => {
    try{
        const senderId = req.user._id;
        const {id: receiverId} = req.params;
        const {text ,image} = req.body;

        if(!text && !image) return res.status(400).json({message: "text or image is required"});
        if(senderId.equals(receiverId)) {
            return res.status(400).json({message: "Cannot send message to yourself"});
        }
        const receiver = await User.findById(receiverId);
        if(!receiver) return res.status(404).json({message: "receiver not found"});

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        // todo: real time sending message using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage Controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getChatPartners = async (req,res) => {
    try {
        const myId = req.user._id;
        const messages = await Message.find({$or: [
            {senderId : myId},
            {recieverId: myId},
        ]});
        const chatPartnersIds = [... new Set(messages.map(msg => msg.senderId === myId ? msg.recieverId : msg.senderId))];
        const chatPartners = await User.find({id: {$in: chatPartnersIds}}).select("-password");

        res.status(200).json(chatPartners);

    } catch (error) {
        console.log("Error in getChatPartners Controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}