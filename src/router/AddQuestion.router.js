// QuestionRouter.js
import { Router } from "express";
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    getCategoriesAndTags,
    deleteQuestionById,
} from "../controllers/AddQuestion.controllers.js";

const router = Router();
router.route("/categories-tags").get(getCategoriesAndTags);
// Route to create a question
router.route("/create").post(createQuestion);

// Route to get all questions
router.route("/all").get(getAllQuestions);

// Route to get a question by ID
router.route("/:id").get(getQuestionById);

// Route to update a question by ID
router.route("/update/:id").put(updateQuestion);

// Route to delete a question by ID
router.route("/delete/:id").delete(deleteQuestion);

// Route to search for questions
router.route("/search").get(searchQuestions);
router.delete("/delete/:id", deleteQuestionById);


export default router;
