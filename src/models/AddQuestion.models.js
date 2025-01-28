import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true, // Removes extra spaces
            set: (value) => value.toLowerCase(), // Converts to lowercase
        },
        problemStatement: { type: String, required: true, trim: true },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },
        sampleTestCases: [TestCaseSchema], // Public test cases
        hiddenTestCases: [TestCaseSchema], // Private test cases
        tags: [
            {
                type: String,
                trim: true,
                set: (value) => value.toLowerCase(), // Converts to lowercase
            },
        ],
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        category: {
            type: String,
            required: true,
            trim: true,
            set: (value) => value.toLowerCase(), // Converts to lowercase
        },
        constraints: { type: String, trim: true },
        optimalSolution: { type: String, trim: true },
        complexity: {
            time: { type: String, trim: true },
            space: { type: String, trim: true },
        },
        functionSignature: { type: String, trim: true }, // Expected function signature for the problem
        hints: [
            {
                type: String,
                trim: true,
                set: (value) => value.toLowerCase(), // Converts to lowercase
            },
        ],
        relatedQuestions: [
            {
                type: String,
                trim: true,
                set: (value) => value.toLowerCase(), // Converts to lowercase
            },
        ],
        problemWrapper: {
            type: String,
       
            trim: true,
            set: (value) => value.toLowerCase(), // Converts to lowercase
        },
    },
    { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
