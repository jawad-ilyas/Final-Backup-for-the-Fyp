
import { Router } from "express";
import { upload } from "../middlerware/multer.middleware.js";
import {
    createCourse,
    updateCourse,
    deleteCourse,
    fetchAllCourses,
    searchCourses,
    searchCoursesByUser,
    fetchCategories
} from "../controller/Course.controllers.js";

const router = Router();

// Route to create a course
router.route("/createcourse").post(upload.single("image"), createCourse);

// Route to update a course
router.route("/updatecourse/:id").put(upload.single("image"), updateCourse);

// Route to fetch all courses
router.route("/fetchallcourses/:id").get(fetchAllCourses);

// Route to search for courses
router.route("/searchcourses").get(searchCourses);
router.route("/searchCoursesByUser").get(searchCoursesByUser);

// Route to delete a course
router.route("/deletecourse/:id").delete(deleteCourse);

// Route to fetch distinct categories
router.route("/fetchcategories").get(fetchCategories);

export default router;
