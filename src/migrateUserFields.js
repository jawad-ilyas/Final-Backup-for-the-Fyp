import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load your .env variables


const runMigration = async () => {
    try {
        // Connect to MongoDB Atlas
        const connection = await mongoose.connect(process.env.DB_URL);



        // Reference the users collection
        const userCollection = mongoose.connection.collection("users");

        // Update all documents to include the new fields with default values
        const result = await userCollection.updateMany(
            {}, // Empty filter matches all documents
            {
                $set: {
                    totalSolved: 0,
                    easyCount: 0,
                    mediumCount: 0,
                    hardCount: 0,
                },
            }
        );

        console.log(`Migration completed. ${result.modifiedCount} documents updated.`);
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

runMigration();
