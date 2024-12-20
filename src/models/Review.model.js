import mongoose from "mongoose"
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    reviewImage: {
        type: String, // Assuming the image is stored as a URL or file path
        required: true
    }
});

export const Review = mongoose.model('Review', reviewSchema);


