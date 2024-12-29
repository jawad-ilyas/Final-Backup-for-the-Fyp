// controllers/student.controllers.js

import User from '../models/User.models.js';
import { asyncHandler } from '../utils/asyncHandler.utils.js';
import { ApiError } from '../utils/ApiError.utils.js';
import { ApiResponse } from '../utils/ApiResponse.utils.js';
import Course from '../models/Course.models.js';
import Module from '../models/Module.models.js';
import Question from '../models/AddQuestion.models.js';
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




/**
 * GET /api/v1/student/courses
 * Return an array of courses the student is enrolled in,
 * each course object including 'enrolledCount' and 'modulesCount'.
 */
export const getStudentCourses = asyncHandler(async (req, res) => {
    const studentId = req.user._id; // from token or session

    // 1) find the student, including their .courses
    const student = await User.findById(studentId).populate("courses");
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // The courses we have here won't have sub-populate for teacher/enrolledStudents
    // so let's get full course docs with deeper populates:
    const courseIds = student.courses.map((c) => c._id);

    // 2) fetch the actual course docs and populate what you need
    const courses = await Course.find({ _id: { $in: courseIds } })
        .populate("teacher", "name")         // teacher name
        .populate("enrolledStudents", "_id") // just get IDs for enrolled
    // .lean(); // optional

    // 3) For each course, we'll count how many modules exist in the Modules collection
    //    We'll do it in parallel with Promise.all for better performance
    const modulesCounts = await Promise.all(
        courses.map((course) => Module.countDocuments({ course: course._id }))
    );

    // 4) build the final array
    const finalCourses = courses.map((course, idx) => {
        const enrolledCount = course.enrolledStudents?.length || 0;
        const modulesCount = modulesCounts[idx];

        return {
            _id: course._id,
            name: course.name,
            description: course.description,
            imageUrl: course.imageUrl,
            teacher: course.teacher, // e.g. { _id, name }
            enrolledCount,
            modulesCount,
        };
    });

    // 5) return them
    res.status(200).json(
        new ApiResponse(200, "Enrolled courses with counts fetched", finalCourses)
    );
});

// GET /api/v1/students/:studentId/stats

export const getStudentProblemStats = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // 1) Find the student
    const student = await User.findById(studentId)
        .populate("solvedQuestions.question", "difficulty")
        .lean();

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // 2) Compute how many are solved overall + distribution by difficulty
    let totalSolved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    // student.solvedQuestions is an array of { question, solvedAt, ... }
    totalSolved = student.solvedQuestions.length;

    student.solvedQuestions.forEach((sq) => {
        const diff = sq.question.difficulty; // "Easy" | "Medium" | "Hard"
        if (diff === "Easy") easyCount++;
        else if (diff === "Medium") mediumCount++;
        else if (diff === "Hard") hardCount++;
    });

    // 3) (Optional) total # of questions in the entire DB
    const totalQuestions = await Question.countDocuments();

    // 4) Return stats
    const stats = {
        totalSolved,
        easyCount,
        mediumCount,
        hardCount,
        totalQuestions,
    };

    res.status(200).json(new ApiResponse(200, "Student stats fetched", stats));
});
