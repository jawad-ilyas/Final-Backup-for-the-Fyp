import Module from "../models/Module.models.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";

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
    const { title, description, startTime, endTime, teacherId , course } = req.body;
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
