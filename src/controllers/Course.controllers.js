import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import Course from "../models/Course.models.js";
import User from "../models/User.models.js";
import { uploadCloudinary } from "../utilis/Cloudinary.utilis.js";

/* -------------------------------------------------------------------------- */
/*                               CREATE COURSE                                */
/* -------------------------------------------------------------------------- */
/**
 * "id" from req.body is the teacher's (user's) ID.
 * We store it in the `teacher` field of the Course document.
 */
export const createCourse = asyncHandler(async (req, res) => {
    const { name, description, category, id } = req.body; // "id" = teacher's user ID

    // Validate required fields
    if (!id) {
        throw new ApiError(400, "Teacher (user) id is required");
    }
    if (!name) {
        throw new ApiError(400, "Course name is required");
    }
    if (!description) {
        throw new ApiError(400, "Course description is required");
    }
    if (!category) {
        throw new ApiError(400, "Course category is required");
    }

    // Check if the course name already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
        throw new ApiError(400, "Course name is already present");
    }

    // Validate and upload the image
    const iconLocalPath = req.file?.path; // Path of the uploaded file
    if (!iconLocalPath) {
        throw new ApiError(400, "Course image is required");
    }

    const uploadedImage = await uploadCloudinary(iconLocalPath);
    if (!uploadedImage || !uploadedImage.url) {
        throw new ApiError(500, "Image upload failed");
    }

    // Create the new course in the database
    const newCourse = await Course.create({
        name,
        description,
        category,
        imageUrl: uploadedImage.url,
        teacher: id, // The teacher's _id
    });
    // 2) Populate the teacher field to include extra info (e.g. name, email)
    const populatedCourse = await Course.findById(newCourse._id)
        .populate("teacher", "name email role") // specify which teacher fields you want
        .lean(); // if you want a plain JS object
    res
        .status(201)
        .json(new ApiResponse(201, "New course created successfully", populatedCourse));
});

/* -------------------------------------------------------------------------- */
/*                               UPDATE COURSE                                */
/* -------------------------------------------------------------------------- */
export const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params; // course ID
    const { name, description, category } = req.body;

    if (!id) {
        throw new ApiError(400, "Course ID is required");
    }

    // Find the course by ID
    const course = await Course.findById(id);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Update fields if provided
    if (name) course.name = name;
    if (description) course.description = description;
    if (category) course.category = category;

    // Check if a new image is provided and upload it
    if (req.file) {
        const iconLocalPath = req.file.path;
        const uploadedImage = await uploadCloudinary(iconLocalPath);
        if (!uploadedImage || !uploadedImage.url) {
            throw new ApiError(500, "Image upload failed");
        }
        course.imageUrl = uploadedImage.url;
    }

    let updatedCourse = await course.save();
    const populatedCourse = await Course.findById(updatedCourse._id)
        .populate("teacher", "name email role") // specify which teacher fields you want
        .lean(); // if you want a plain JS object


    res
        .status(200)
        .json(
            new ApiResponse(200, "Course updated successfully", populatedCourse)
        );
});

/* -------------------------------------------------------------------------- */
/*                               DELETE COURSE                                */
/* -------------------------------------------------------------------------- */
export const deleteCourse = asyncHandler(async (req, res) => {
    const { id } = req.params; // course ID

    if (!id) {
        throw new ApiError(400, "Course ID is required");
    }

    const result = await Course.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
        throw new ApiError(404, "Course not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Course deleted successfully"));
});

/* -------------------------------------------------------------------------- */
/*                               FETCH ALL COURSES                            */
/* -------------------------------------------------------------------------- */
/**
 *  Returns ALL courses in the DB for everyone.
 *  (GET /api/v1/courses/all)
 */
export const fetchAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find();
    if (!courses || courses.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No courses found", []));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "All courses fetched", courses));
});

/* -------------------------------------------------------------------------- */
/*                               SEARCH COURSES                               */
/* -------------------------------------------------------------------------- */
/**
 *  GET /api/v1/courses/searchcourses
 *  Accepts query params: ?query=xxx&category=xxx&teacherId=xxx
 *  If teacherId is present, we filter by teacher. Otherwise, show all.
 */
export const searchCourses = asyncHandler(async (req, res) => {
    const { query, category, teacherId } = req.query;

    const searchCriteria = {};
    console.log("techer Id ", teacherId)
    // If teacherId is provided, filter by teacher
    if (teacherId) {
        searchCriteria.teacher = teacherId;
    }

    // If query is provided, search name or description
    if (query) {
        searchCriteria.$or = [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }

    // If category is provided, filter by category (case-insensitive)
    if (category) {
        searchCriteria.category = { $regex: category, $options: "i" };
    }

    const courses = await Course.find(searchCriteria)
        .populate("teacher", "name email role");
    res
        .status(200)
        .json(new ApiResponse(200, "Courses fetched successfully", courses));
});

/* -------------------------------------------------------------------------- */
/*                          SEARCH COURSES BY USER                            */
/* -------------------------------------------------------------------------- */
/**
 *  GET /api/v1/courses/searchcoursesbyuser?userId=...
 *  Redundant if you can do the same with teacherId in searchCourses.
 */
export const searchCoursesByUser = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        throw new ApiError(400, "User (teacher) ID is required");
    }

    const courses = await Course.find({ teacher: userId })
        .populate("teacher", "name email role");
    if (!courses || courses.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No courses found for this user", []));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Courses fetched successfully", courses));
});

/* -------------------------------------------------------------------------- */
/*                             FETCH CATEGORIES                               */
/* -------------------------------------------------------------------------- */
/**
 *  GET /api/v1/courses/fetchcategories
 *  Returns the distinct list of categories from the Course DB
 */
export const fetchCategories = asyncHandler(async (req, res) => {
    const categories = await Course.distinct("category");
    res
        .status(200)
        .json(
            new ApiResponse(200, "Categories fetched successfully", categories)
        );
});

/* -------------------------------------------------------------------------- */
/*                           ADD STUDENT TO COURSE                            */
/* -------------------------------------------------------------------------- */
/**
 *  POST /api/v1/courses/:courseId/add-student
 *  Body: { studentEmail, teacherId }
 *
 *  Because the updated schema expects `enrolledStudents: [{ student: ObjectId, status }]`,
 *  we must find the User by email to get their _id. If no user is found, we throw an error.
 *  If the teacher is not the owner of the course, we throw an error.
 */
export const addStudentToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { studentEmail, teacherId } = req.body; // rename "email" -> "studentEmail" for clarity

    if (!studentEmail) {
        throw new ApiError(400, "Student email is required");
    }
    if (!teacherId) {
        throw new ApiError(400, "Teacher ID is required");
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Ensure the teacher adding the student owns the course
    if (course.teacher.toString() !== teacherId) {
        throw new ApiError(
            403,
            "You are not authorized to add students to this course"
        );
    }

    // Find the student by email
    const studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
        // If the user does not exist in the DB, we cannot enroll them
        throw new ApiError(400, "Student with that email does not exist");
    }

    // Check if the student is already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
        (enroll) => enroll.student.toString() === studentUser._id.toString()
    );

    if (alreadyEnrolled) {
        throw new ApiError(400, "Student is already enrolled in this course");
    }

    // Enroll the student
    course.enrolledStudents.push({
        student: studentUser._id,
        status: "accepted", // or "pending" if you want to verify
    });

    // Also add this course to the user's "courses" array
    studentUser.courses.push(course._id);

    await Promise.all([course.save(), studentUser.save()]);

    res
        .status(200)
        .json(new ApiResponse(200, "Student added to the course"));
});

/* -------------------------------------------------------------------------- */
/*                             FETCH TEACHERS                                 */
/* -------------------------------------------------------------------------- */
/**
 *  GET /api/v1/courses/fetchteachers
 *  Returns all users where role="teacher".
 *  If no teachers are found, returns an empty array.
 */
export const fetchTeachers = asyncHandler(async (req, res) => {
    const teachers = await User.find({ role: "teacher" });

    if (!teachers || teachers.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, "No teachers found", []));
    }

    res
        .status(200)
        .json(new ApiResponse(200, "Teachers fetched successfully", teachers));
});
