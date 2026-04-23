import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const migrateData = async () => {
    try {
        await mongoose.connect(`${process.env.DATABASE}`);
        console.log("Connected to DB for migration");
        
        const db = mongoose.connection.db;
        const collection = db!.collection("vocabularies");
        
        const vocabs = await collection.find({}).toArray();
        console.log(`Found ${vocabs.length} documents to process.`);

        let updatedCount = 0;

        for (const vocab of vocabs) {
            let changed = false;
            let updateObj: any = {};

            const transform = (exs: any[]) => {
                if (!exs || !Array.isArray(exs) || exs.length === 0) return exs;
                // If already migrated, skip
                if (exs[0].sentences) return exs;
                
                return exs.map((ex: any) => ({
                    title: ex.title || ex.word || "",
                    sentences: [{ 
                        text: ex.sentence || ex.text || "", 
                        translation: ex.translation || "" 
                    }]
                }));
            };

            // Migrate main examples
            if (vocab.examples && vocab.examples.length > 0 && !vocab.examples[0].sentences) {
                updateObj.examples = transform(vocab.examples);
                changed = true;
            }

            // Migrate wordFamily examples
            if (vocab.wordFamily && Array.isArray(vocab.wordFamily)) {
                let wfChanged = false;
                const newWf = vocab.wordFamily.map((wf: any) => {
                    if (wf.examples && wf.examples.length > 0 && !wf.examples[0].sentences) {
                        wfChanged = true;
                        return { ...wf, examples: transform(wf.examples) };
                    }
                    return wf;
                });
                if (wfChanged) {
                    updateObj.wordFamily = newWf;
                    changed = true;
                }
            }

            // Migrate relatedWords examples
            if (vocab.relatedWords && Array.isArray(vocab.relatedWords)) {
                let rwChanged = false;
                const newRw = vocab.relatedWords.map((rw: any) => {
                    if (rw.examples && rw.examples.length > 0 && !rw.examples[0].sentences) {
                        rwChanged = true;
                        return { ...rw, examples: transform(rw.examples) };
                    }
                    return rw;
                });
                if (rwChanged) {
                    updateObj.relatedWords = newRw;
                    changed = true;
                }
            }

            // Check for collocations to remove
            if (vocab.collocations) {
                if (!updateObj.$unset) updateObj.$unset = {};
                updateObj.$unset.collocations = "";
                changed = true;
            }

            if (changed) {
                const finalUpdate: any = {};
                if (updateObj.$unset) {
                    finalUpdate.$unset = updateObj.$unset;
                    delete updateObj.$unset;
                }
                if (Object.keys(updateObj).length > 0) {
                    finalUpdate.$set = updateObj;
                }
                
                await collection.updateOne({ _id: vocab._id }, finalUpdate);
                updatedCount++;
            }
        }

        console.log(`Migration completed. Updated ${updatedCount} documents.`);
        
        // Final broad cleanup for collocations just in case
        const rawRes = await collection.updateMany(
            { collocations: { $exists: true } },
            { $unset: { collocations: "" } }
        );
        console.log(`Global cleanup: Removed 'collocations' field from ${rawRes.modifiedCount} additional documents.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Migration failed:", err);
    }
};

migrateData();
