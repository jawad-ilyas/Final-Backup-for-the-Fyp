import mongoose from "mongoose";

// Schema for individual question submission within a module
const QuestionSubmissionSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question", // References the Question model
        required: true,
    },
    code: {
        type: String, // The student's solution code
        required: true,
    },
    output: {
        type: String, // Output generated by the student's code
    },
    marksAwarded: {
        type: Number, // Marks awarded for this question
        default: 0,
    },
    eachQuestionMark: {
        type: Number, // Marks awarded for this question
        default: 0,
    },
    remarks: {
        type: String, // Feedback or remarks for the question
    },
    correctSolution: {
        type: String, // Correct solution provided by AI/teacher
    },
    aiFeedback: {
        type: String, // AI-generated feedback for the student
    },
});

const SubmissionSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course", // References the Course model
            required: true,
        },
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module", // References the Module model
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // References the User model (teacher role)
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // References the User model (student role)
            required: true,
        },
        questions: [QuestionSubmissionSchema], // Array of question submissions
        totalMarks: {
            type: Number, // Total marks awarded for the module
            default: 0,
        },
        maxTotalMarks: {
            type: Number, // Maximum marks for the module
            required: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now, // When the student submitted the module
        },
        gradedAt: {
            type: Date, // When the submission was graded
        },
    },
    { timestamps: true }
);

export default mongoose.model("Submission", SubmissionSchema);
