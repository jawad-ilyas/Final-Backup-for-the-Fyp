import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
                course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
                marks: { type: Number, default: 0 },
            },
        ],
    },
    {
        timestamps: true,
    }
);

moduleSchema.index({ course: 1, startTime: 1 }); // Example composite index

const Module = mongoose.model("Module", moduleSchema);
export default Module;
