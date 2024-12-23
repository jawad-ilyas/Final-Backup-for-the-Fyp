import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        problemStatement: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Easy',
        },
        sampleTestCases: [TestCaseSchema],
        hiddenTestCases: [TestCaseSchema],
        tags: [{ type: String }],
        // If each question belongs to a specific module
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
        },
        // If you also want to track which teacher created it
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        category: { type: String, required: true },
        constraints: { type: String },
        optimalSolution: { type: String },
        complexity: {
            time: { type: String },
            space: { type: String },
        },
        functionSignature: { type: String },
        hints: [{ type: String }],
        relatedQuestions: [{ type: String }],
    },
    { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
