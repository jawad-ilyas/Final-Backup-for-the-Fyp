import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
    createCourse,
    updateCourse,
    deleteCourse,
    fetchAllCourses,
    searchCourses,
    searchCoursesByUser,
    fetchCategories,
    addStudentToCourse,
    fetchTeachers,
} from "../controllers/Course.controllers.js";

const router = Router();
// fetch categories
router.get("/fetchcategories", fetchCategories);
// create course (POST w/ image)
router.post("/createcourse", upload.single("image"), createCourse);

// update course (PUT w/ image)
router.put("/updatecourse/:id", upload.single("image"), updateCourse);

// delete course
router.delete("/deletecourse/:id", deleteCourse);

// fetch all courses
router.get("/all", fetchAllCourses);

// search courses
router.get("/searchcourses", searchCourses);

// search courses by user
router.get("/searchcoursesbyuser", searchCoursesByUser);
router.get("/teachers", fetchTeachers);



// add student
router.post("/:courseId/add-student", addStudentToCourse);

export default router;
