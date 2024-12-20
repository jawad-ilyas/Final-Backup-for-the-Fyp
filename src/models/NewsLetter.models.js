import mongoose from "mongoose";


const NewsLetterSchema = new mongoose.Schema({


    email: {
        type: String,
        required: [true, "email is required for subscribe newsletter"]
    },
    message: {
        type: String,
        required: [true, "message is required for subscribe newsletter"]
    },
    name: {
        type: String,
        required: [true, "message is required for subscribe newsletter"]
    }


}, { timestamps: true })


export const NewsLetter = mongoose.model("NewsLetter", NewsLetterSchema)