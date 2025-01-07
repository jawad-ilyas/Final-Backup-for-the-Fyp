import { Router } from "express";
import { createModule, getModulesByCourse, deleteModule, updateModule, addQuestionsToModuleAndCourse, getModuleById, downloadModuleQuestions, submitModuleSolutions, deleteQuestionFromModule } from "../controllers/Module.controllers.js";

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
// GET /api/v1/modules/:moduleId => getModuleById


// GET /api/v1/modules/:moduleId/download-questions => downloadModuleQuestions
router.get("/:moduleId/download-questions", downloadModuleQuestions);

// POST /api/v1/modules/:moduleId/submit => submitModuleSolutions
router.post("/:moduleId/submit", submitModuleSolutions);

// router for the delete question from the module
router.delete("/:moduleId/questions/:questionId", deleteQuestionFromModule);

export default router;
