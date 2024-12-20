import User from "../models/Auth.models.js";
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import bcrypt from "bcryptjs";

/**
 * @desc Fetch user profile
 * @route GET /api/v1/user/profile
 * @access Protected
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, "User profile fetched successfully", user));
});

/**
 * @desc Update user profile
 * @route PUT /api/v1/user/profile
 * @access Protected
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { name, password } = req.body;

    // Update fields
    if (name) user.name = name;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    // Return updated user info excluding the password
    res.status(200).json(
        new ApiResponse(200, "User profile updated successfully", {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        })
    );
});
