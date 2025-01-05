import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import Course from "../models/Course.models.js";
import User from "../models/User.models.js";
import { uploadCloudinary } from "../utils/Cloudinary.utils.js";
import { sendEnrollmentEmail } from "../utils/email.utils.js";
import Module from "../models/Module.models.js";
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
    const courses = await Course.find()
        .populate("teacher", "name email role");
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
// course.controllers.js
function generateRandomPassword(length = 12) {
    // Define the character set you want to allow in the password
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?,./-=";

    let password = "";
    for (let i = 0; i < length; i++) {
        // Pick a random index from the chars string
        const randomIndex = Math.floor(Math.random() * chars.length);
        // Append the character at that index to 'password'
        password += chars[randomIndex];
    }

    return password;
}
// POST /api/v1/courses/:courseId/add-student
export const addStudentToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    console.log("courseId", courseId)
    const { email, teacherId } = req.body;
    console.log("email into the add student to course ", email)
    console.log("teacherId into the add student to course ", teacherId)
    // console.log("[addStudentToCourse] courseId:", courseId, "email:", email, "teacherId:", teacherId);

    // 1) Find course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }
    let password;
    // 2) If user doesn’t exist, create
    let user = await User.findOne({ email });
    if (!user) {
        password = generateRandomPassword(10); // 10-char password

        console.log("[addStudentToCourse] Creating new user with email:", email);
        user = await User.create({ email, role: "student", password });
    }

    // 3) Already enrolled check
    const alreadyEnrolled = course.enrolledStudents.some(
        (enroll) => enroll.student.toString() === user._id.toString()
    );
    console.log("alreadyEnrolled", alreadyEnrolled)
    if (alreadyEnrolled) {
        return res
            .status(200)
            .json(new ApiResponse(200, "Student is already enrolled", course));
    }

    // 4) Enroll them
    course.enrolledStudents.push({ student: user._id, status: "accepted" });
    user.courses.push(course._id);

    await Promise.all([course.save(), user.save()]);

    // 5) Possibly send an email to the new student
    // sendEnrollmentEmail(email, course.name).catch(err => console.error(err));
    // optional
    try {
        await sendEnrollmentEmail(email, course.name, password);
    } catch (emailErr) {
        console.error("Failed to send enrollment email:", emailErr);
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Student added to the course", { course, user })
        );
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


export const getCourseMates = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
        .populate("enrolledStudents.student", "name email") // So you see each student’s name/email
        .lean();

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // The array `course.enrolledStudents` now has sub-docs like:
    // { student: { _id, name, email }, status, ... }
    res
        .status(200)
        .json(
            new ApiResponse(200, "Fetched course mates", course.enrolledStudents)
        );
});


export const getEnrolledCourses = asyncHandler(async (req, res) => {
    // Suppose req.user._id is the student's ID (from auth middleware)
    const user = await User.findById(req.user._id)
        .populate("courses", "name description teacher")
        .lean();
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(
        new ApiResponse(200, "Enrolled courses fetched", user.courses)
    );
});


/**
 * GET /api/v1/courses/:courseId/enrolled-students
 * Returns an array of enrolled students for the given course
 */
export const getEnrolledStudents = asyncHandler(async (req, res) => {

    const { courseId } = req.params;

    const course = await Course.findById(courseId)
        .populate("enrolledStudents.student", "name email role")
        .lean();

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // The array course.enrolledStudents is like:
    // [ { student: { _id, name, email }, status: "accepted" }, ... ]
    // You can transform or rename fields as needed.

    res.status(200).json(
        new ApiResponse(
            200,
            "Fetched enrolled students successfully",
            course.enrolledStudents
        )
    );
});

/**
 * DELETE /api/v1/courses/:courseId/enrolled-students/:studentId
 * Removes the student from the course (not necessarily from the DB)
 */
export const removeStudentFromCourse = asyncHandler(async (req, res) => {
    const { courseId, studentId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Filter out that student
    const prevLength = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents.filter(
        (enroll) => enroll.student.toString() !== studentId
    );

    if (course.enrolledStudents.length === prevLength) {
        throw new ApiError(404, "Student not found in this course");
    }

    await course.save();

    // Optionally also remove the course from the user's 'courses' array
    let user = await User.findById(studentId);
    if (user) {
        user.courses = user.courses.filter(c => c.toString() !== courseId);
        await user.save();
    }

    res.status(200).json(
        new ApiResponse(
            200,
            "Removed student from course",
            { courseId, studentId }
        )
    );
});


/**
 * GET /api/v1/courses/:courseId/modules
 * Return an array of modules for this course
 */
export const getCourseModules = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    // Optional: verify the student is enrolled in this course, or skip if not needed
    console.log(courseId)
    // fetch the modules referencing this course
    const modules = await Module.find({ course: courseId })
        .populate('course', 'name description') // Populate course name and description
        .lean();
    // or .populate(...) if you want teacher or question info

    // Optionally, if you want to attach a "questionsCount" field for each module:
    // or just do a .map on modules to count module.questions.length if you store them in the module doc

    res
        .status(200)
        .json(new ApiResponse(200, "Modules fetched successfully", modules));
});