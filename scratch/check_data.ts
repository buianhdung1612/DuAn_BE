import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Vocabulary from "../models/vocabulary.model";

const checkData = async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE}`);
        console.log("Connected to DB");
        
        const samples = await Vocabulary.find().limit(3).lean();
        console.log(JSON.stringify(samples, null, 2));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkData();
