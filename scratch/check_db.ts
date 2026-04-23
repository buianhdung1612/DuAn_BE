import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.DATABASE || "");
        console.log("Connected to DB");
        if (!mongoose.connection.db) throw new Error("No DB");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        for (const col of collections) {
             const count = await mongoose.connection.collection(col.name).countDocuments();
             console.log(`Collection ${col.name}: ${count} docs`);
             if (col.name.includes("week") || col.name.includes("productivity")) {
                  const docs = await mongoose.connection.collection(col.name).find({}).toArray();
                  console.log(`Docs in ${col.name}:`, JSON.stringify(docs, null, 2));
             }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
