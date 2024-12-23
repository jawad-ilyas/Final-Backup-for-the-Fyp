import User from "../models/User.models.js"; // or wherever your User model is
import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { uploadCloudinary } from "../utilis/Cloudinary.utilis.js";

/* -------------------------------------------------------------------------- */
/*                        GET TEACHER BY ID (for Profile)                     */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/teachers/:id
 * Fetch a teacher by their _id, excluding password
 */
export const getTeacherById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Find the teacher by ID
    const teacher = await User.findById(id)
        .select("-password") // remove password field
        .lean();

    if (!teacher) {
        throw new ApiError(404, "Teacher not found");
    }

    // Return the teacher’s data
    res
        .status(200)
        .json(new ApiResponse(200, "Teacher fetched successfully", teacher));
});


/* -------------------------------------------------------------------------- */
/*                       UPDATE TEACHER PROFILE (with Image)                  */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/teachers/:id
 * Fields from form-data:
 *  - image (file)
 *  - name, slug, branding, reports, includeInEmails, twitter, facebook, linkedin, etc.
 */

export const updateTeacherProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1) Find teacher by ID
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "teacher") {
        throw new ApiError(404, "Teacher not found or user is not a teacher");
    }

    // 2) If there's a file in `req.file`, handle image upload
    if (req.file) {
        const uploadedImage = await uploadCloudinary(req.file.path);
        if (!uploadedImage || !uploadedImage.url) {
            throw new ApiError(500, "Image upload failed");
        }
        // Update teacher’s `imageUrl`
        teacher.imageUrl = uploadedImage.url;
    }

    // 3) Update optional text fields from req.body
    // Example fields. Add or remove as needed:
    const updatableFields = [
        "name",
        "slug",
        "branding",
        "reports",
        "includeInEmails",
        "twitter",
        "facebook",
        "linkedin",
    ];

    updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            teacher[field] = req.body[field];
        }
    });

    // 4) Save updated teacher
    const updatedTeacher = await teacher.save();

    res.status(200).json(
        new ApiResponse(200, "Teacher profile updated successfully", updatedTeacher)
    );
});





/* -------------------------------------------------------------------------- */
/*                        GET ALL TEACHERS w/ Filters                         */
/* -------------------------------------------------------------------------- */
export const getAllTeachers = asyncHandler(async (req, res) => {
    const { search, courseCount, sortField } = req.query;

    // We'll build an aggregate pipeline so we can filter by # of courses easily
    const pipeline = [
        // Stage 1: Match only role: "teacher"
        { $match: { role: "teacher" } },
    ];

    // Stage 2: If search is provided, let's do a text or regex match
    if (search) {
        // For example, we can do a $match with $or on name, bio, etc.
        pipeline.push({
            $match: {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { bio: { $regex: search, $options: "i" } },
                    // etc. if you want subjects or location
                ],
            },
        });
    }

    // Stage 3: If we need to filter by # of courses, we can do a $project to get the size
    pipeline.push({
        $addFields: {
            coursesCount: { $size: { $ifNull: ["$courses", []] } },
        },
    });

    // Stage 4: Based on courseCount param
    if (courseCount === "exact1") {
        pipeline.push({ $match: { coursesCount: 1 } });
    } else if (courseCount === "2plus") {
        pipeline.push({ $match: { coursesCount: { $gte: 2 } } });
    }

    // Stage 5: Sorting
    if (sortField === "createdAtAsc") {
        pipeline.push({ $sort: { createdAt: 1 } });
    } else if (sortField === "createdAtDesc") {
        pipeline.push({ $sort: { createdAt: -1 } });
    } else {
        // default sort by name ascending
        pipeline.push({ $sort: { name: 1 } });
    }

    // Now run the aggregate
    const teachers = await User.aggregate(pipeline);

    res
        .status(200)
        .json(new ApiResponse(200, "Teachers fetched successfully", teachers));
});

/* -------------------------------------------------------------------------- */
/*                         UPDATE TEACHER IMAGE ONLY                          */
/* -------------------------------------------------------------------------- */
/**
 * PATCH /api/v1/teachers/:id/image
 * Body: form-data with "image" file
 */
export const updateTeacherImage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1) Find teacher by ID
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== "teacher") {
        throw new ApiError(404, "Teacher not found or user is not a teacher");
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

    // 4) Update teacher’s imageUrl
    teacher.imageUrl = uploaded.url;
    const updatedTeacher = await teacher.save();

    // 5) Respond with success
    res.status(200).json(
        new ApiResponse(200, "Teacher image updated successfully", {
            _id: updatedTeacher._id,
            imageUrl: updatedTeacher.imageUrl,
        })
    );
});