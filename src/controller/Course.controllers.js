import { asyncHandler } from "../utilis/asyncHandler.utilis.js";
import { ApiError } from "../utilis/ApiError.utilis.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import Course from "../models/Course.models.js";
import { uploadCloudinary } from "../utilis/Cloudinary.utilis.js";

/**
 * @desc Create a new course
 * @route POST /api/v1/courses/createcourse
 * @access Protected
 */
export const createCourse = asyncHandler(async (req, res) => {
    const { name, description, category, id } = req.body;

    // Validate required fields
    if (!id) {
        throw new ApiError(400, "user id is required");
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

    // Check if the course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
        throw new ApiError(400, "Course name is already present");
    }

    // Validate and upload the image
    const iconLocalPath = req.file?.path; // Path of the uploaded file
    console.log()
    if (!iconLocalPath) {
        throw new ApiError(400, "Course image is required");
    }

    const uploadedImage = await uploadCloudinary(iconLocalPath);
    if (!uploadedImage || !uploadedImage.url) {
        throw new ApiError(500, "Image upload failed");
    }

    console.log("user id for course creation  ", id)
    // Create the new course in the database
    const newCourse = await Course.create({
        name,
        description,
        category,
        imageUrl: uploadedImage.url,
        user: id, // Assumes the user is added to req by middleware
    });

    // Return a success response
    res.status(201).json(new ApiResponse(201, "New course created successfully", newCourse));
});






export const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, category } = req.body;

    // Validate required fields
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

    // Save the updated course
    const updatedCourse = await course.save();

    // Return a success response
    res.status(200).json(new ApiResponse(200, "Course updated successfully", updatedCourse));
});





export const deleteCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate course ID
    if (!id) {
        throw new ApiError(400, "Course ID is required");
    }

    // Find the course by ID
    const course = await Course.deleteOne({ _id: id });
    if (!course) {
        throw new ApiError(404, "Course not found");
    }



    // Return a success response
    res.status(200).json(new ApiResponse(200, "Course deleted successfully"));
});

export const fetchAllCourses = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the user ID from the request parameters
    console.log("User ID for fetching courses:", id);

    try {
        // Fetch courses that match the user ID
        const courses = await Course.find({ userId: id });

        if (courses.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, "No courses found for this user ID", [])
            );
        }

        // Return the courses in the response
        res.status(200).json(
            new ApiResponse(200, "Courses fetched successfully", courses)
        );
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json(
            new ApiResponse(500, "An error occurred while fetching courses")
        );
    }
});

export const searchCourses = asyncHandler(async (req, res) => {
    const { query, category, teacherId } = req.query;

    // Ensure teacherId is provided
    if (!teacherId) {
        throw new ApiError(400, "Teacher ID is required");
    }

    const searchCriteria = { user: teacherId }; // Filter by teacher ID

    if (query) {
        searchCriteria.$or = [
            { name: { $regex: query, $options: "i" } }, // Case-insensitive search for course name
            { description: { $regex: query, $options: "i" } }, // Case-insensitive search for course description
        ];
    }

    if (category) {
        searchCriteria.category = { $regex: category, $options: "i" }; // Case-insensitive match for category
    }

    const courses = await Course.find(searchCriteria);

    res.status(200).json(new ApiResponse(200, "Courses fetched successfully", courses));
});


export const searchCoursesByUser = asyncHandler(async (req, res) => {
    const { userId } = req.query;

    // Validate userId
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    // Search for courses created by the user
    const courses = await Course.find({ user: userId });

    if (!courses || courses.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No courses found for this user"));
    }

    // Return the courses created by the user
    res.status(200).json(new ApiResponse(200, "Courses fetched successfully", courses));
});

export const fetchCategories = asyncHandler(async (req, res) => {
    // Use MongoDB distinct to fetch unique categories
    const categories = await Course.distinct("category");

    // Return the categories
    res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
});

// Add student to a course
export const addStudentToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { email, teacherId } = req.body;
    console.log("req.params:", req.params);
    console.log("req.body:", req.body);

    if (!email) {
        throw new ApiError(400, "Student email is required");
    }
    if (!teacherId) {
        throw new ApiError(400, "Teacher ID is required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Ensure the teacher adding the student is the owner of the course
    if (course.teacherId.toString() !== teacherId) {
        throw new ApiError(403, "You are not authorized to add students to this course");
    }

    // Check if the student is already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
        (student) => student.email === email
    );
    if (alreadyEnrolled) {
        throw new ApiError(400, "Student is already enrolled in this course");
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (user) {
        // Add the user to the course
        course.enrolledStudents.push({ email, status: "accepted" });
        user.courses.push(course._id);
        await user.save();
    } else {
        // Add the student with a pending status
        course.enrolledStudents.push({ email, status: "pending" });
        // Trigger email invitation logic here
    }

    await course.save();
    res.status(200).json({ message: "Student added to the course" });
});
