import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const {MONGODB_URI} = process.env;
    if(!MONGODB_URI) throw new Error("MONGODB_URI is not set");
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(connection.STATES.connected);
  } catch (error) {
    console.log(`connectDB Error: ${error}`);
    process.exit(1);
  }
};
