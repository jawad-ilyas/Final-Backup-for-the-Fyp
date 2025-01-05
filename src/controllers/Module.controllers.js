import Module from "../models/Module.models.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import PDFDocument from "pdfkit"; // npm install pdfkit
import User from "../models/User.models.js";
import path from "path";
import fs from "fs";
/* -------------------------------------------------------------------------- */
/*                             CREATE A NEW MODULE                            */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/v1/modules
 * Request body should include:
 *  - title
 *  - description
 *  - startTime
 *  - endTime
 *  - course (ObjectId)
 *  - teacher (ObjectId)
 */
export const createModule = asyncHandler(async (req, res) => {
    const { title, description, startTime, endTime, courseId, teacherId } = req.body;
    console.log("title", title, "description", description, "startTime", startTime, "endTime", endTime, "courseId", courseId, "teacherId", teacherId);
    // Validate required fields
    if (!title || !description || !startTime || !endTime || !courseId || !teacherId) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "Start time must be before end time");
    }

    // Create and save the module
    const newModule = await Module.create({
        title,
        description,
        startTime,
        endTime,
        course: courseId,
        teacher: teacherId,
    });

    res
        .status(201)
        .json(new ApiResponse(201, "Module created successfully", newModule));
});

/* -------------------------------------------------------------------------- */
/*                        FETCH MODULES BY COURSE ID                          */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/modules/course/:courseId?teacher=...
 * For example: /api/v1/modules/course/123?teacher=456
 *
 * We assume route param is courseId and query param is teacher
 */
export const getModulesByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { teacher } = req.query; // replaced teacherId with teacher

    // Validate required fields
    if (!teacher) {
        throw new ApiError(400, "Teacher ID is required");
    }

    // Fetch modules for the specific course and teacher
    // e.g., Module.find({ course: courseId, teacher })
    const modules = await Module.find({ course: courseId, teacher }).sort({
        startTime: 1,
    });

    res
        .status(200)
        .json(new ApiResponse(200, "Modules fetched successfully", modules));
});

/* -------------------------------------------------------------------------- */
/*                           DELETE A MODULE BY ID                            */
/* -------------------------------------------------------------------------- */
/**
 * DELETE /api/v1/modules/:id
 * Removes a module by its _id
 */
export const deleteModule = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find and delete the module
    const module = await Module.findByIdAndDelete(id);

    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Module deleted successfully"));
});

/* -------------------------------------------------------------------------- */
/*                           UPDATE A MODULE BY ID                            */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/modules/:id
 * Request body should include:
 *  - title
 *  - description
 *  - startTime
 *  - endTime
 *  - teacher (ObjectId)
 *  - course (ObjectId)
 */
export const updateModule = asyncHandler(async (req, res) => {
    const { id } = req.params; // Module ID
    console.log("module id ", id);
    const { title, description, startTime, endTime, teacherId, course } = req.body;
    console.log("------------------------------")
    console.log("updateModule case")
    console.log("------------------------------")
    console.log("title", title, "description", description, "startTime", startTime, "endTime", endTime, "teacherId", teacherId, "course", course);
    // Validate required fields
    if (!title || !description || !startTime || !endTime || !teacherId || !course) {
        throw new ApiError(400, "All fields are required");
    }


    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "Start time must be before end time");
    }

    // Find the module by ID and course
    // e.g., we ensure the module belongs to the specified course
    const module = await Module.findOne({ _id: id, course });
    if (!module) {
        throw new ApiError(
            404,
            "Module not found or does not belong to the specified course"
        );
    }

    // Ensure the teacher updating the module is the same as the one who created it
    if (module.teacher.toString() !== teacherId) {
        throw new ApiError(403, "You are not authorized to update this module");
    }

    // Update module fields
    module.title = title;
    module.description = description;
    module.startTime = startTime;
    module.endTime = endTime;

    // Save the updated module
    const updatedModule = await module.save();

    res
        .status(200)
        .json(new ApiResponse(200, "Module updated successfully", updatedModule));
});





/**
 * POST /api/v1/modules/:moduleId/add-questions
 * Body: { courseId: "...", questionIds: [ "...", "..." ] }
 * This pushes { question: questionId, course: courseId } into module.questions
 */
export const addQuestionsToModuleAndCourse = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { courseId, questionsData } = req.body;
    // questionsData is an array of objects like: [{ questionId, marks }, { ... }, ...]

    if (!courseId) {
        throw new ApiError(400, "courseId is required");
    }
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
        throw new ApiError(400, "questionsData must be a non-empty array");
    }

    // Ensure the module exists
    const module = await Module.findById(moduleId);
    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    // Build the array of subdocuments we want to insert
    const newEntries = questionsData.map((item) => ({
        question: item.questionId,
        course: courseId,
        marks: item.marks || 0, // or handle default if not provided
    }));

    // Use $addToSet.$each to add multiple items, skipping duplicates
    await Module.updateOne(
        { _id: moduleId },
        {
            $addToSet: {
                questions: { $each: newEntries },
            },
        }
    );

    // (Optional) re-fetch the updated module to show new state
    const updatedModule = await Module.findById(moduleId);

    res
        .status(200)
        .json(new ApiResponse(200, "Questions added to module", updatedModule));
});


/**
 * GET /api/v1/modules/:moduleId
 * Populates the module's 'questions.question' field to show question details
 */
export const getModuleById = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    // 1) Find the module by ID
    //    Populate questions.question => so we see question "title", "difficulty", etc.
    const module = await Module.findById(moduleId)
        .populate("questions.question", "title difficulty category tags sampleTestCases teacher problemStatement marks")
        .populate("teacher", "name email");

    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    // Return the module doc with populated question data
    res.status(200).json(
        new ApiResponse(200, "Module fetched successfully", module)
    );
});
// export const getModuleById = asyncHandler(async (req, res) => {
//     const { moduleId } = req.params;

//     // 1) Find the module by ID
//     //    Populate questions.question => so we see question "title", "difficulty", etc.
//     const module = await Module.findById(moduleId)
//         .populate("questions.question", "title difficulty category tags sampleTestCases teacher problemStatement" );

//     if (!module) {
//         throw new ApiError(404, "Module not found");
//     }

//     // Return the module doc with populated question data
//     res.status(200).json(
//         new ApiResponse(200, "Module fetched successfully", module)
//     );
// });



/**
 * GET /api/v1/modules/:moduleId/download-questions?format=pdf
 * or /download-questions?format=docx if you want docx
 */
export const downloadModuleQuestions = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { format } = req.query; // e.g. "pdf" or "docx"

    // find the module, populate questions
    const module = await Module.findById(moduleId)
        .populate("questions.question");
    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    // If format === "pdf", we generate a PDF
    if (format === "pdf") {
        // create a new PDFDocument
        const doc = new PDFDocument({ size: "A4", margin: 50 });

        // set the response headers so the browser knows it's a file download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="module_${moduleId}_questions.pdf"`
        );

        // pipe the PDF doc to the response
        doc.pipe(res);

        // Title
        doc.fontSize(16).text(`Module: ${module.title}`, { underline: true });
        doc.moveDown();

        // For each question
        module.questions.forEach((qObj, index) => {
            const q = qObj.question;
            doc.fontSize(14).text(`Question ${index + 1}: ${q.title}`, {
                underline: true,
            });
            doc.moveDown(0.5);

            // show problem statement or code
            doc.fontSize(12).text(q.problemStatement || "No statement available.");
            doc.moveDown(1.5);
        });

        doc.end(); // finalize the PDF
    } else if (format === "docx") {
        // do your .docx generation approach (like the docx library),
        // then pipe or send the file. For brevity, we skip the example code
        throw new ApiError(501, "DOCX generation not implemented yet.");
    } else {
        throw new ApiError(400, "Invalid format. Use ?format=pdf or ?format=docx");
    }
});


/**
 * POST /api/v1/modules/:moduleId/submit
 * Body: { solutions: [ { questionId, code, text }, ... ] }
 * We'll check if now <= endTime, else reject
 */
export const submitModuleSolutions = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { solutions } = req.body; // an array of { questionId, code, text } or so

    const module = await Module.findById(moduleId);
    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    // Check time-bound
    const now = new Date();
    if (now > module.endTime) {
        throw new ApiError(400, "Submission deadline has passed");
    }
    if (now < module.startTime) {
        throw new ApiError(400, "Module hasn't started yet");
    }

    // store the student's solutions in DB
    // you could do something like:
    // const submission = new Submission({
    //   module: moduleId,
    //   student: req.user._id,
    //   solutions,
    //   submittedAt: now
    // });
    // await submission.save();

    // or you might store them in module if you want, but that might not scale
    // module.submissions.push({ student: req.user._id, solutions });
    // await module.save();

    res
        .status(200)
        .json(new ApiResponse(200, "Submission successful", { /* ... */ }));
});