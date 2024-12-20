import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Programming', 'Data Science', 'Web Development'], // Predefined categories
        },
        imageUrl: {
            type: String, // Store the URL/path of the uploaded image
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
