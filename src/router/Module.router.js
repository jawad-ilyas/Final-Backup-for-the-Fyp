import { Router } from "express";
import { createModule, getModulesByCourse, deleteModule, updateModule } from "../controller/Module.controllers.js";

const router = Router();

// Route to create a module
router.post("/create", createModule);

// Route to fetch modules by course ID
router.get("/course/:courseId", getModulesByCourse);

// Route to delete a module by ID
router.delete("/delete/:id", deleteModule);
router.put("/update/:id", updateModule); // Add this line

export default router;
