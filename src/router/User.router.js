import express from "express";
import { getUserProfile, updateUserProfile } from "../controller/User.controllers.js";
import { protect } from "../middlerware/Auth.Middleware.js";

const router = express.Router();

router.route("/profile")
    .get(protect, getUserProfile)  // Fetch user profile
    .put(protect, updateUserProfile); // Update user profile

export default router;
