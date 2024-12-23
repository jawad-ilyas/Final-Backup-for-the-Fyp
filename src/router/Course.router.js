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
    getEnrolledCourses,
    getCourseMates,
    getEnrolledStudents,
    removeStudentFromCourse
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
router.get("/:courseId/students", getCourseMates);
// user.routes.js
router.get("/courses", getEnrolledCourses);
/**
 * GET /api/v1/courses/:courseId/enrolled-students
 * => getEnrolledStudents
 */
router.get("/:courseId/enrolled-students", getEnrolledStudents);

/**
 * DELETE /api/v1/courses/:courseId/enrolled-students/:studentId
 * => removeStudentFromCourse
 */
router.delete("/:courseId/enrolled-students/:studentId", removeStudentFromCourse);
export default router;
