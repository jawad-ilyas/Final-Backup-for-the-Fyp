import Module from "../models/Module.models.js";
import { ApiResponse } from '../utilis/ApiResponse.js';
import { asyncHandler } from '../utilis/asyncHandler.utilis.js';
import { ApiError } from "../utilis/ApiError.utilis.js";

// Create a new module
export const createModule = asyncHandler(async (req, res) => {
    const { title, description, startTime, endTime, courseId, teacherId } = req.body;

    // Validate required fields
    if (!title || !description || !startTime || !endTime || !courseId || !teacherId) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "Start time must be before end time");
    }

    // Create and save the module
    const module = await Module.create({
        title,
        description,
        startTime,
        endTime,
        courseId,
        teacherId,
    });

    res.status(201).json(new ApiResponse(201, "Module created successfully", module));
});

// Fetch modules by course ID
export const getModulesByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { teacherId } = req.query;

    // Validate required fields
    if (!teacherId) {
        throw new ApiError(400, "Teacher ID is required");
    }

    // Fetch modules for the specific course and teacher
    const modules = await Module.find({ courseId, teacherId }).sort({ startTime: 1 });

    res.status(200).json(new ApiResponse(200, "Modules fetched successfully", modules));
});

// Delete a module by ID
export const deleteModule = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find and delete the module
    const module = await Module.findByIdAndDelete(id);

    if (!module) {
        throw new ApiError(404, "Module not found");
    }

    res.status(200).json(new ApiResponse(200, "Module deleted successfully"));
});


// Update a module by ID
export const updateModule = asyncHandler(async (req, res) => {
    const { id } = req.params; // Module ID
    const { title, description, startTime, endTime, teacherId, courseId } = req.body;

    // Validate required fields
    if (!title || !description || !startTime || !endTime || !teacherId || !courseId) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate time
    if (new Date(startTime) >= new Date(endTime)) {
        throw new ApiError(400, "Start time must be before end time");
    }

    // Find the module by ID and course
    const module = await Module.findOne({ _id: id, courseId });

    if (!module) {
        throw new ApiError(404, "Module not found or does not belong to the specified course");
    }

    // Ensure the teacher updating the module is the same as the one who created it
    if (module.teacherId.toString() !== teacherId) {
        throw new ApiError(403, "You are not authorized to update this module");
    }

    // Update module fields
    module.title = title;
    module.description = description;
    module.startTime = startTime;
    module.endTime = endTime;

    // Save the updated module
    const updatedModule = await module.save();

    res.status(200).json(new ApiResponse(200, "Module updated successfully", updatedModule));
});

