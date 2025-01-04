
import User from '../models/User.models.js';
import { asyncHandler } from '../utils/asyncHandler.utils.js';
import { ApiError } from '../utils/ApiError.utils.js';
import { ApiResponse } from '../utils/ApiResponse.utils.js';
import Course from '../models/Course.models.js';
import Module from '../models/Module.models.js';
import Question from '../models/AddQuestion.models.js';
import { uploadCloudinary } from "../utils/Cloudinary.utils.js";

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

    try {
        const updatedStudent = await student.save();
        res.status(200).json(new ApiResponse(200, 'Student updated successfully', updatedStudent));
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Customize the error response for validation errors
            throw new ApiError(400, 'Validation failed', { errors: err.errors });
        } else {
            throw err;
        }
    }
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
    // console.log("get student courses for", studentId);
    // 1) find the student, including their .courses
    const student = await User.findById(studentId).populate("courses");
    // console.log("student course in which that enrolled ", student)
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




// ---------- Controller for the Student Profie Show ---------------

export const getStudentProfile = asyncHandler(async (req, res) => {

    const { studentId } = req.params;
    // console.log("getStudentProfile is called ")

    const student = await User.findById(studentId)
        .populate("courses", "name description")
        .populate("solvedQuestions.question", "difficulty")
        .lean();
    // console.log("student profile ", student)
    res.status(200).json(new ApiResponse(200, "Student stats fetched", student));

});




export const updateStudentProfileImage = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Validate the file exists
    if (!req.file) {
        throw new ApiError(400, "No image file uploaded.");
    }

    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Upload the image to Cloudinary
    const uploadedImage = await uploadCloudinary(req.file.path);
    if (!uploadedImage || !uploadedImage.url) {
        throw new ApiError(500, "Image upload to Cloudinary failed.");
    }

    // Update the student's profile image URL
    student.imageUrl = uploadedImage.url;
    const updatedStudent = await student.save();

    res.status(200).json({
        success: true,
        message: "Student profile image updated successfully.",
        data: updatedStudent,
    });
});


export const updateStudentProfile = asyncHandler(async (req, res) => {

    console.log("called updateStudentProfile")
    const { studentId: id } = req.params; // Alias studentId to id
    console.log("id ", id)
    const { name, email, password, major, twitter, linkedin, facebook, bio } = req.body;
    // add a console .log for all  
    console.log("name ", name)
    console.log("email ", email)
    console.log("password ", password)
    console.log("major ", major)
    console.log("twitter ", twitter)
    console.log("linkedin ", linkedin)
    console.log("facebook ", facebook)
    console.log("bio ", bio)

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) {
        throw new ApiError(404, 'Student not found');
    }

    // Update fields if present
    if (name !== undefined) student.name = name;
    if (password !== undefined) student.password = password;
    if (email !== undefined) student.email = email;
    if (major !== undefined) student.major = major;
    if (twitter !== undefined) student.twitter = twitter;
    if (linkedin !== undefined) student.linkedin = linkedin;
    if (facebook !== undefined) student.facebook = facebook;
    if (bio !== undefined) student.bio = bio;
    const updatedStudent = await student.save();

    // Refetch the updated student data to include any required populated fields
    const refreshedStudent = await User.findById(updatedStudent._id)
        .populate("courses", "name")
        .populate("solvedQuestions.question", "difficulty")
        .lean();

    res.status(200).json({
        success: true,
        message: "Student profile updated successfully.",
        data: refreshedStudent, // Return the refreshed student object
    });
    res
        .status(200)
        .json(new ApiResponse(200, 'Student updated successfully', updatedStudent));
});