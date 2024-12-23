import { Router } from "express";
import {
    registerUser,
    loginUser
} from "../controllers/Auth.controllers.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                             REGISTER USER                                  */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/v1/auth/registerUser
 * Creates a new user
 */
router.route("/registerUser").post(registerUser);

/* -------------------------------------------------------------------------- */
/*                                LOGIN USER                                  */
/* -------------------------------------------------------------------------- */
/**
 * POST /api/v1/auth/login
 * Logs in an existing user
 */
router.route("/login").post(loginUser);

export default router;
