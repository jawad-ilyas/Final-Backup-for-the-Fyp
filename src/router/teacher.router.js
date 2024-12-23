import { Router } from "express";
import {
    getAllTeachers,        // GET /api/v1/teachers?search=...&courseCount=...&sortField=...
    getTeacherById,        // GET /api/v1/teachers/:id
    updateTeacherProfile,  // PUT /api/v1/teachers/:id (text fields)
    updateTeacherImage,    // PATCH /api/v1/teachers/:id/image
} from "../controllers/teacher.controllers.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = Router();

// For listing/filtering teachers
router.get("/", getAllTeachers);

// For fetching one teacher by ID
router.get("/:id", getTeacherById);

// For updating teacher text fields
router.put("/:id", upload.none(), updateTeacherProfile);

// For updating teacher image alone
router.patch("/:id/image", upload.single("image"), updateTeacherImage);

export default router;
