import { Router } from "express";
import { upload } from "../middlerware/multer.middleware.js";
import {
    createCourse,
    updateCourse,
    deleteCourse,
    fetchAllCourses,
    searchCourses,
    searchCoursesByUser,
    fetchCategories,
    addStudentToCourse
} from "../controller/Course.controllers.js";
import { protect } from "../middlerware/auth.middleware.js"; // Import authentication middleware

const router = Router();

// Route to create a course
router.route("/createcourse").post(upload.single("image"),  createCourse);

// Route to update a course
router.route("/updatecourse/:id").put(upload.single("image"),  updateCourse);

// Route to fetch all courses
router.route("/fetchallcourses/:id").get( fetchAllCourses);

// Route to search for courses
router.route("/searchcourses").get( searchCourses);
router.route("/searchCoursesByUser").get( searchCoursesByUser);

// Route to delete a course
router.route("/deletecourse/:id").delete( deleteCourse);

// Route to fetch distinct categories
router.route("/fetchcategories").get( fetchCategories);

// Route to add a student to a course
router.route("/:courseId/add-student").post( addStudentToCourse);

export default router;
