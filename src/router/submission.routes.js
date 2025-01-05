import express from "express";
import {
    submitModule,
    getSubmissionsByStudent,
    getSubmissionById,
    getSubmissionsByCourseAndStudent,
    submitSingleQuestion,
    getSubmissionsByTeacherCourseModule,
    deleteSubmission,
} from "../controllers/submission.controller.js";
import { protect } from "../middleware/auth.middleware.js"; // Middleware for authentication

const router = express.Router();

// Routes
router.post("/:moduleId/submit", protect, submitModule); // Submit a module
router.get("/student", protect, getSubmissionsByStudent); // Get all submissions for a student
router.get("/:id", protect, getSubmissionById); // Get a single submission by ID
router.get("/course/:courseId", protect, getSubmissionsByCourseAndStudent);


// ! router for the handle the single question submit by student for the practice case 
router.post("/:studentId/singlequestion", submitSingleQuestion); // Submit a module
router.get(
    "/submissionssubmited/:teacherId/:courseId/:moduleId",
    getSubmissionsByTeacherCourseModule
);
// Route for deleting a submission
router.delete(
    "/submissions/:teacherId/:studentId/:courseId/:moduleId",
    deleteSubmission
);

export default router;
