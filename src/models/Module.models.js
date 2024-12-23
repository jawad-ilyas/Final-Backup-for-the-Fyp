import mongoose from 'mongoose';

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
            ref: 'Course',
            required: true,
        },
        // If modules can have different teachers than the main course teacher:
        // Or you can rely on course.teacher to determine ownership
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

moduleSchema.index({ course: 1, startTime: 1 }); // Example composite index

const Module = mongoose.model('Module', moduleSchema);
export default Module;
