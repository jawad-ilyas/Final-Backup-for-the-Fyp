import { Router } from "express";
import { addProjectCategrory, deleteProjectCategory, showProjectCategrory } from "../controller/ProjectCategory.controller.js";


const router = Router();




router.route("/addProjectCategrory").post(addProjectCategrory)
router.route("/showProjectCategrory").get(showProjectCategrory)
router.route("/deleteProjectCategory").post(deleteProjectCategory)



export default router;