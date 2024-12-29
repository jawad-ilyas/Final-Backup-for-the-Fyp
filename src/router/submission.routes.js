import express from "express";
import {
    submitModule,
    getSubmissionsByStudent,
    getSubmissionById,
    getSubmissionsByCourseAndStudent,
} from "../controllers/submission.controller.js";
import { protect } from "../middleware/auth.middleware.js"; // Middleware for authentication

const router = express.Router();

// Routes
router.post("/:moduleId/submit", protect, submitModule); // Submit a module
router.get("/student", protect, getSubmissionsByStudent); // Get all submissions for a student
router.get("/:id", protect, getSubmissionById); // Get a single submission by ID
router.get("/course/:courseId", protect, getSubmissionsByCourseAndStudent);

export default router;
