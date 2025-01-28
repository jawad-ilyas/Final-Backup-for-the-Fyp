import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables
import { connectDb } from "./db/index.db.js";

const runMigration = async () => {
    try {
        // Connect to MongoDB


        connectDb().
        then(async () => {
            // Reference the questions collection
            const questionCollection = mongoose.connection.collection("questions");

            // Update all documents to include the new problemWrapper field with a default value
            const result = await questionCollection.updateMany(
                {}, // Match all documents
                {
                    $set: {
                        problemWrapper: "default-wrapper", // Default value for the new field
                    },
                }
            );

            console.log(`Migration completed. ${result.modifiedCount} documents updated.`);
        })
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

runMigration();
