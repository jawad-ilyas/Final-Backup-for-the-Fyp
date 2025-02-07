// routes/student.routes.js
import { Router } from "express";
import {
    getStudentById,
    updateStudent,
    removeStudent,
    getStudentCourses, // new controller
    getStudentProblemStats,
    getStudentProfile,
    updateStudentProfileImage,
    updateStudentProfile,
} from "../controllers/student.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
// or any “studentCheck” middleware if you have role-based checks
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

/**
 * GET /api/v1/students/courses => getStudentCourses
 */
router.get("/courses", protect, getStudentCourses);  // e.g. for "my courses"

/**
 * GET /api/v1/students/:id => getStudentById
 */
router.get("/:id", getStudentById);

/**
 * PUT /api/v1/students/:id => updateStudent
 */
router.put("/:id", updateStudent);

/**
 * DELETE /api/v1/students/:id => removeStudent
 */
router.delete("/:id", removeStudent);
router.get('/:studentId/stats', getStudentProblemStats);






// * routes for the student  profile
router.get("/:studentId/getStudentProfile", protect, getStudentProfile);
router.post("/:studentId/updateStudentProfileImage", protect, upload.single("image"), updateStudentProfileImage);
router.post("/:studentId/updateStudentProfile", protect, updateStudentProfile);



export default router;
