import { Router } from "express";
import { createWorkExperience, deleteWorkExperience, fetchWorkExperience, createWork, fetchExperiences, deleteExperience } from "../controller/Experience.Controller.js";


const router = Router();



router.route("/createworkexperience").post(createWorkExperience)
router.route("/fetchworkexperience").get(fetchWorkExperience)
router.route("/deleteworkexperience/:id").delete(deleteWorkExperience)
router.route("/deleteexperience/:id").delete(deleteExperience)
router.route("/creatework").post(createWork)
router.route("/fetchexperiences").get(fetchExperiences)


export default router