import mongoose from 'mongoose';

const enrolledStudentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',        // store the actual User _id, not just email
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted'],
            default: 'pending',
        },
    },
    { _id: false } // We can skip generating a sub-document _id if you like
);

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
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        imageUrl: {
            type: String,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // The teacher/owner of this course
        },
        // Students who are enrolled or pending
        enrolledStudents: [enrolledStudentSchema],
    },
    { timestamps: true }
);

// Example index if you often query by category
courseSchema.index({ category: 1 });

export default mongoose.model('Course', courseSchema);
