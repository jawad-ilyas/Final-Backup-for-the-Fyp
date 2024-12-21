import mongoose from "mongoose";

const enrolledStudentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
    },
});

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    enrolledStudents: [enrolledStudentSchema],
});

export default mongoose.model("Course", courseSchema);
