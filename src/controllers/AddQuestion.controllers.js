import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import Question from "../models/AddQuestion.models.js";

/* -------------------------------------------------------------------------- */
/*                             CREATE QUESTION                                */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/v1/questions
 * Body can include:
 *  - title (required)
 *  - problemStatement (required)
 *  - difficulty (enum: [Easy, Medium, Hard], default=Easy)
 *  - sampleTestCases[] (array of { input, output })
 *  - hiddenTestCases[] (array of { input, output })
 *  - tags[]
 *  - module (ObjectId reference to Module)
 *  - teacher (ObjectId reference to User)
 *  - category (required)
 *  - constraints, optimalSolution, complexity { time, space }, functionSignature, hints[], relatedQuestions[]
 */
export const createQuestion = asyncHandler(async (req, res) => {
    // Destructure fields from request body
    let {
        title,
        problemStatement,
        difficulty,
        tags,
        category,
        sampleTestCases,
        hiddenTestCases,
        module,
        teacher,
        constraints,
        optimalSolution,
        complexity,
        functionSignature,
        hints,
        relatedQuestions,
    } = req.body;

    // Validate required fields
    if (!title) throw new ApiError(400, "Question title is required");
    if (!problemStatement)
        throw new ApiError(400, "Problem statement is required");
    if (!category) throw new ApiError(400, "Category is required");
    // If `tags` is an array, clean them up
    // e.g. turn ["  Array "," String ","Hash Table "] into ["array","string","hash table"]
    if (Array.isArray(tags)) {
        tags = tags.map((tag) => tag.trim().toLowerCase());
    }
    // Build a question object
    const newQuestionData = {
        title,
        problemStatement,
        difficulty: difficulty || "Easy",
        tags,
        category,
        sampleTestCases,
        hiddenTestCases,
        module,             // optional field if your app logic allows
        teacher,           // optional field if your app logic allows
        constraints,
        optimalSolution,
        complexity,
        functionSignature,
        hints,
        relatedQuestions,
    };

    // Create a new question
    const newQuestion = await Question.create(newQuestionData);

    res
        .status(201)
        .json(
            new ApiResponse(201, "Question created successfully", newQuestion)
        );
});

/* -------------------------------------------------------------------------- */
/*                          GET ALL QUESTIONS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/questions
 * Returns an array of all questions in the DB
 */
export const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find();
    res
        .status(200)
        .json(
            new ApiResponse(200, "Questions fetched successfully", questions)
        );
});

/* -------------------------------------------------------------------------- */
/*                           GET QUESTION BY ID                               */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/questions/:id
 * Returns a single question by its _id
 */
export const getQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log("question by id is called id ", id)
    const question = await Question.findById(id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, "Question fetched successfully", question)
        );
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE QUESTION BY ID                            */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/questions/:id
 * Body can include any of the fields in the question schema
 */
export const updateQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // We can directly pass req.body to findByIdAndUpdate, but to enforce
    // validation or specific logic, you could destructure fields similarly
    // to createQuestion
    const updatedData = req.body;

    const question = await Question.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
    });

    if (!question) throw new ApiError(404, "Question not found");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Question updated successfully", question)
        );
});

/* -------------------------------------------------------------------------- */
/*                           DELETE QUESTION BY ID                            */
/* -------------------------------------------------------------------------- */
/**
 * DELETE /api/v1/questions/:id
 * Removes a question document entirely
 */
export const deleteQuestion = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) throw new ApiError(404, "Question not found");

    res
        .status(200)
        .json(new ApiResponse(200, "Question deleted successfully"));
});

/* -------------------------------------------------------------------------- */
/*                           SEARCH QUESTIONS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/questions/search?tag=xxx&category=xxx&difficulty=xxx&teacher=xxx&module=xxx
 * 
 * You can expand this to also filter by teacher or module if needed
 */
export const searchQuestions = asyncHandler(async (req, res) => {
    const { tag, category, difficulty, teacher, module } = req.query;

    const query = {};

    // If you want to search by teacher or module:
    if (teacher) {
        query.teacher = teacher;
    }
    if (module) {
        query.module = module;
    }

    if (tag) {
        query.tags = { $regex: tag, $options: "i" };
    }
    if (category) {
        query.category = { $regex: category, $options: "i" };
    }
    if (difficulty) {
        query.difficulty = difficulty; // Must be "Easy", "Medium", or "Hard"
    }

    const questions = await Question.find(query);
    res
        .status(200)
        .json(
            new ApiResponse(200, "Questions fetched successfully", questions)
        );
});

/* -------------------------------------------------------------------------- */
/*                       GET DISTINCT CATEGORIES AND TAGS                     */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/questions/distinct
 * Returns a list of unique categories and tags
 */
export const getCategoriesAndTags = asyncHandler(async (req, res) => {
    // Fetch unique categories
    const categories = await Question.distinct("category");

    // Fetch and sort unique tags
    const tagsAgg = await Question.aggregate([
        { $unwind: "$tags" },          // Split each array item into its own doc
        { $group: { _id: "$tags" } },  // Group by the tag value
        { $sort: { _id: 1 } },         // Sort alphabetically (ascending)
    ]);
    const tags = tagsAgg.map((item) => item._id);

    res
        .status(200)
        .json(
            new ApiResponse(200, "Fetched categories and tags", {
                categories,
                tags,
            })
        );
});

// export const getCategoriesAndTags = asyncHandler(async (req, res) => {
//     const categories = await Question.distinct("category");
//     const tags = await Question.distinct("tags");
//     res
//         .status(200)
//         .json(
//             new ApiResponse(200, "Fetched categories and tags", {
//                 categories,
//                 tags,
//             })
//         );
// });

/* -------------------------------------------------------------------------- */
/*                           DELETE QUESTION BY ID                            */
/* -------------------------------------------------------------------------- */
/**
 * (Duplicate? If you have a separate route or prefer naming "deleteQuestionById")
 * DELETE /api/v1/questions/:id
 */
export const deleteQuestionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Question deleted successfully"));
});
