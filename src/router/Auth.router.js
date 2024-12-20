import { Router } from "express";
import { registerUser, loginUser, fetchUsers, deleteUser } from "../controller/Auth.controllers.js";

const router = Router();

router.route("/registerUser").post(registerUser);
router.route("/login").post(loginUser);
router.route("/users").get(fetchUsers);
router.route("/users/:id").delete(deleteUser);

export default router;