// controllers/student.controllers.js

import User from '../models/User.models.js';
import { asyncHandler } from '../utilis/asyncHandler.utilis.js';
import { ApiError } from '../utilis/ApiError.utilis.js';
import { ApiResponse } from '../utilis/ApiResponse.js';

/* -------------------------------------------------------------------------- */
/*                          GET STUDENT BY ID                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/students/:id
 */
export const getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find user with role=student
    const student = await User.findOne({ _id: id, role: 'student' }).lean();
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    res.status(200).json(new ApiResponse(200, 'Student fetched successfully', student));
});

/* -------------------------------------------------------------------------- */
/*                          UPDATE STUDENT BY ID                              */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/students/:id
 * Body can include name, email, password, or other fields
 */
export const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    // Update fields if present
    if (name !== undefined) student.name = name;
    if (email !== undefined) student.email = email;
    if (password !== undefined) student.password = password; // triggers hashing in pre-save

    const updatedStudent = await student.save();

    res
        .status(200)
        .json(new ApiResponse(200, 'Student updated successfully', updatedStudent));
});

/* -------------------------------------------------------------------------- */
/*                          REMOVE STUDENT BY ID                              */
/* -------------------------------------------------------------------------- */
/**
 * DELETE /api/v1/students/:id
 * Actually remove from DB or do some "soft delete" logic
 */
export const removeStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    // EITHER permanently remove:
    await User.deleteOne({ _id: student._id });

    // OR "soft delete" set role='removed' or something
    // student.role = 'removed';
    // await student.save();

    res.status(200).json(new ApiResponse(200, 'Student removed successfully'));
});
