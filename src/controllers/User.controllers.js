import User from "../models/User.models.js";
import bcrypt from "bcryptjs";

import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

/* -------------------------------------------------------------------------- */
/*                          GET USER PROFILE                                  */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/user/profile (protected)
 *
 * Fetches the profile of the currently logged-in user.
 * "req.user" is typically set by your auth middleware.
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    console.log("req user id", req.user);
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, "User profile fetched successfully", user)
    );
});

/* -------------------------------------------------------------------------- */
/*                          UPDATE USER PROFILE                               */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/user/profile (protected)
 *
 * Updates the user's name and/or password.
 * If a new password is provided, it gets hashed before saving.
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { name, password } = req.body;

    if (name) user.name = name;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json(
        new ApiResponse(200, "User profile updated successfully", {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        })
    );
});

/* -------------------------------------------------------------------------- */
/*                                FETCH USERS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/users (admin-only)
 *
 * Returns an array of all users in the system.
 * In a real app, you'd likely restrict this to admins or add pagination.
 */
export const fetchUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    res
        .status(200)
        .json(new ApiResponse(200, "Fetched all users", users));
});

/* -------------------------------------------------------------------------- */
/*                                DELETE USER                                 */
/* -------------------------------------------------------------------------- */
/**
 * DELETE /api/v1/users/:id (admin-only)
 *
 * Deletes a user by their ID.
 * Returns 404 if the user isn't found.
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (deletedUser) {
        res.status(200).json(
            new ApiResponse(200, "User deleted successfully", deletedUser)
        );
    } else {
        res
            .status(404)
            .json(new ApiResponse(404, "User not found"));
    }
});

/* -------------------------------------------------------------------------- */
/*                           GET ALL TEACHERS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/users/teachers?role=teacher (admin-only)
 *
 * Optionally passes ?role=teacher to only fetch teachers. 
 * If no role param is provided, returns all users.
 */
export const getAllTeachers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const query = {};

    if (role) {
        query.role = role;
    }

    const users = await User.find(query);

    if (!users.length) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, `No ${role || "users"} found`, [])
            );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            `${role || "Users"} fetched successfully`,
            users
        )
    );
});


export const getEnrolledCourses = asyncHandler(async (req, res) => {
    // Suppose req.user._id is the logged-in student
    const user = await User.findById(req.user._id)
        .populate("courses", "name description teacher")
        .lean();
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Fetched enrolled courses", user.courses));
});

/* -------------------------------------------------------------------------- */
/*                         UPDATE TEACHER IMAGE ONLY                          */
/* -------------------------------------------------------------------------- */
/**
 * PATCH /api/v1/teachers/:id/image
 * Body: form-data with "image" file
 */
export const updateUserImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1) Find teacher by ID
    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "Teacher not found or user is not a user");
    }

    // 2) If no file, throw error
    if (!req.file) {
        throw new ApiError(400, "No image file provided");
    }

    // 3) Upload the image to Cloudinary (or your chosen service)
    const uploaded = await uploadCloudinary(req.file.path);
    if (!uploaded || !uploaded.url) {
        throw new ApiError(500, "Image upload failed");
    }

    // 4) Update user’s imageUrl
    user.imageUrl = uploaded.url;
    const updatedTeacher = await user.save();

    // 5) Respond with success
    res.status(200).json(
        new ApiResponse(200, "Teacher image updated successfully", {
            _id: updatedTeacher._id,
            imageUrl: updatedTeacher.imageUrl,
        })
    );
});