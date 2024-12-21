import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import Question from "../models/AddQuestion.models.js";

/**
 * @desc Create a new question
 * @route POST /api/v1/questions
 * @access Protected
 */
export const createQuestion = asyncHandler(async (req, res) => {
    const { title, problemStatement, difficulty, tags, category, sampleTestCases, hiddenTestCases } = req.body;

    // Validate required fields
    if (!title) throw new ApiError(400, "Question title is required");
    if (!problemStatement) throw new ApiError(400, "Problem statement is required");
    if (!category) throw new ApiError(400, "Category is required");

    // Create a new question
    const newQuestion = await Question.create({
        title,
        problemStatement,
        difficulty: difficulty || "Easy",
        tags,
        category,
        sampleTestCases,
        hiddenTestCases,
    });

    // Return response
    res.status(201).json(new ApiResponse(201, "Question created successfully", newQuestion));
});

/**
 * @desc Get all questions
 * @route GET /api/v1/questions
 * @access Public
 */
export const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find();
    res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questions));
});

/**
 * @desc Get a single question by ID
 * @route GET /api/v1/questions/:id
 * @access Public
 */
export const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    res.status(200).json(new ApiResponse(200, "Question fetched successfully", question));
});


/**
 * @desc Update a question by ID
 * @route PUT /api/v1/questions/:id
 * @access Protected
 */
export const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    const question = await Question.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!question) throw new ApiError(404, "Question not found");

    res.status(200).json(new ApiResponse(200, "Question updated successfully", question));
});

/**
 * @desc Delete a question by ID
 * @route DELETE /api/v1/questions/:id
 * @access Protected
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) throw new ApiError(404, "Question not found");

    res.status(200).json(new ApiResponse(200, "Question deleted successfully"));
});

/**
 * @desc Search questions by tag, category, or difficulty
 * @route GET /api/v1/questions/search
 * @access Public
 */
export const searchQuestions = asyncHandler(async (req, res) => {
    const { tag, category, difficulty } = req.query;
    const query = {};

    if (tag) query.tags = { $regex: tag, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query);

    res.status(200).json(new ApiResponse(200, "Questions fetched successfully", questions));
});

// Controller function to get unique categories and tags
export const getCategoriesAndTags = asyncHandler(async (req, res) => {
    const categories = await Question.distinct("category");
    const tags = await Question.distinct("tags");
    res.status(200).json(new ApiResponse(200, "Fetched categories and tags", { categories, tags }));
});


export const deleteQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    res.status(200).json(new ApiResponse(200, "Question deleted successfully"));
});