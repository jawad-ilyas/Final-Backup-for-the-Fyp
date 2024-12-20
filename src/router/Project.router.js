import { Router } from "express";
import { createProjects, deleteProjects, fetchProjects, updateProject } from "../controller/Project.Contoller.js";
import { upload } from "../middlerware/multer.middleware.js";


const router = Router()


router.route("/createProjects").post(upload.single("projectImage"),createProjects)
router.route("/fetchProjects").get(fetchProjects)
router.route("/deleteProjects/:_id").delete(deleteProjects)
router.route("/updateProject/:_id").patch(updateProject)


export default router