import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Vocabulary from "../models/vocabulary.model";

const backupData = async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE}`);
        console.log("Connected to DB for backup");
        
        const allVocabs = await Vocabulary.find().lean();
        const backupPath = path.join(__dirname, "../backups");
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath);
        }
        
        const fileName = `vocabulary_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        const filePath = path.join(backupPath, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(allVocabs, null, 2));
        console.log(`Backup created successfully at: ${filePath}`);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Backup failed:", err);
    }
};

backupData();
