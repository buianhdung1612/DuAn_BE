import dotenv from "dotenv";
import mongoose from "mongoose";

// Load env variables
dotenv.config();

const dbUri = process.env.DATABASE || "mongodb+srv://buianh09dung:Dd147741%40@cluster0.i3isheh.mongodb.net/wdp301";

async function runMigration() {
    try {
        console.log("Connecting to database...", dbUri);
        await mongoose.connect(dbUri);
        console.log("Database connected successfully!");

        const db = mongoose.connection.db;

        // 1. Update all blogs to "english"
        console.log("Migrating Blogs to english...");
        const blogResult = await db.collection("blogs").updateMany(
            {},
            { $set: { module: "english" } }
        );
        console.log(`Updated ${blogResult.modifiedCount} blogs to module="english".`);

        // 2. Update all blog categories to "english"
        console.log("Migrating Blog Categories (categories-blog) to english...");
        const catBlogResult = await db.collection("categories-blog").updateMany(
            {},
            { $set: { module: "english" } }
        );
        console.log(`Updated ${catBlogResult.modifiedCount} blog categories to module="english".`);

        // 3. Update all mindmaps to "english"
        console.log("Migrating Mind Maps (mind-maps) to english...");
        const mindMapResult = await db.collection("mind-maps").updateMany(
            {},
            { $set: { module: "english" } }
        );
        console.log(`Updated ${mindMapResult.modifiedCount} mind maps to module="english".`);

        // 4. Update all mindmap categories to "english"
        console.log("Migrating Mind Map Categories (categories-mindmap) to english...");
        const catMindMapResult = await db.collection("categories-mindmap").updateMany(
            {},
            { $set: { module: "english" } }
        );
        console.log(`Updated ${catMindMapResult.modifiedCount} mind map categories to module="english".`);

        // Print out diagnostic details
        const sampleCats = await db.collection("categories-blog").find({}).limit(10).toArray();
        console.log("Sample Categories (categories-blog) after update:", sampleCats.map(c => ({ id: c._id, name: c.name, module: c.module })));

        const sampleBlogs = await db.collection("blogs").find({}).limit(5).toArray();
        console.log("Sample Blogs after update:", sampleBlogs.map(b => ({ id: b._id, name: b.name, module: b.module, category: b.category })));

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

runMigration();
