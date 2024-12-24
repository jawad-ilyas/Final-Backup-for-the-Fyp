import { Router } from "express";
import { createModule, getModulesByCourse, deleteModule, updateModule, addQuestionsToModuleAndCourse, getModuleById } from "../controllers/Module.controllers.js";

const router = Router();

// Route to create a module
router.post("/create", createModule);

// Route to fetch modules by course ID
router.get("/course/:courseId", getModulesByCourse);

// Route to delete a module by ID
router.delete("/delete/:id", deleteModule);
router.put("/update/:id", updateModule); // Add this line
router.post("/:moduleId/add-questions", addQuestionsToModuleAndCourse);
router.get("/:moduleId", getModuleById);

export default router;
