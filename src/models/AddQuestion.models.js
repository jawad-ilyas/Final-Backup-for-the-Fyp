// AddQuestionModelBackend.js
import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
});

const AddQuestionSchema = new mongoose.Schema({
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
}, { timestamps: true });

export default mongoose.model('Question', AddQuestionSchema);
