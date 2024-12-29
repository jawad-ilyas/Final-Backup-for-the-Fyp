import { Router } from "express";
import {
    getUserProfile,
    updateUserProfile,
    fetchUsers,
    deleteUser,
    getAllTeachers,
    getEnrolledCourses,
    updateUserImage
} from "../controllers/User.controllers.js";
import {protect} from "../middleware/auth.middleware.js";
const router = Router();
import multer from "multer";

const upload = multer({ dest: "/public/temp" });

/* -------------------------------------------------------------------------- */
/*                          GET USER PROFILE                                  */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/user/profile
 * Returns the logged-in user's profile
 */
router.get("/profile", protect, getUserProfile);

/* -------------------------------------------------------------------------- */
/*                          UPDATE USER PROFILE                               */
/* -------------------------------------------------------------------------- */
/**
 * PUT /api/v1/user/profile
 * Updates the logged-in user's profile
 */
router.put("/profile",  protect, updateUserProfile);

/* -------------------------------------------------------------------------- */
/*                            FETCH ALL USERS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/users
 * Returns all users (admin only)
 */
router.get("/", /* protect, adminCheck, */ fetchUsers);

/* -------------------------------------------------------------------------- */
/*                               DELETE USER                                  */
/* -------------------------------------------------------------------------- */
/**
 * DELETE /api/v1/users/:id
 * Removes a user (admin only)
 */
router.delete("/:id", /* protect, adminCheck, */ deleteUser);

/* -------------------------------------------------------------------------- */
/*                           GET ALL TEACHERS                                 */
/* -------------------------------------------------------------------------- */
/**
 * GET /api/v1/users/teachers?role=teacher
 * Returns all teachers (admin only)
 */
router.get("/teachers", /* protect, adminCheck, */ getAllTeachers);
router.get("/courses",  getEnrolledCourses);
router.patch("/:id/image", upload.single("image"), updateUserImage);

export default router;
