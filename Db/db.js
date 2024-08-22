import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();



export default function connectDB() {
    mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}`)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));
};
 