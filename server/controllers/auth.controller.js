import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { generateToken } from './../lib/utils.js ';
import cloudinary from '../lib/cloudinary.js';

export const signupController = async (req,res) => {
    let {fullName, email, password} = req.body;
    fullName = fullName.trim();
    email = email.trim().toLowerCase();
    password = password.trim();
    
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message : "All fields are required"});
        }
        if(password < 6){
            return res.status(400).json({message : "Password must have atleast 6 characters"})
        }

        const regex = /^[^@]+@[^@]+\.[^@]+$/;
        if(!regex.test(email)){
            return res.status(400).json({message : "email is incorrect"});
        }
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message:"User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password : hashPassword,
        })

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id,res);
            res.status(200).json({
                _id : savedUser._id,
                fullName : savedUser.fullName,
                email : savedUser.email,
                profilePic : savedUser.pic,
            })
        }else{
            res.status(400).json({message : "Invalid Credentials"});
        }
    } catch (error) {
        console.log("Error in Sign up Controller: ", error);
        res.status(500).json({ message : "Internal Server Error"});
    }
}

export const loginController = async (req,res) => {
    let {email,password} = req.body;
    email = email.trim();
    password = password.trim();
    if(!email || !password) return res.status(400).json({message : "Email and Password are required"});
    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message : "Invalid Credentials"});

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({message : "Invalid Credentials"});

        const token = generateToken(user._id,res);
        res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.pic,
        });

    } catch (error) {
        console.log("Error in login Controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const logoutController = (_,res) => {
    res.cookie("jwt","",{ maxAge:0 });
    res.status(200).json({message :"Logged out Successfully"});
}

export const updateProfileController = async (req,res) => {
    try {
        const {profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message : "profile pic is required"});

        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {pic: uploadResponse.secure_url},
            { new: true }
        ).select("-password");
        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfileController: ", error);
        res.status(500).json("Internal Server Error");
    }
}