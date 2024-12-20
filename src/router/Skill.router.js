import { Router } from "express";
import { upload } from "../middlerware/multer.middleware.js";
import { createSkill, deleteSkill, fetchSKill } from "../controller/Skill.Controller.js";


const router = Router();

router.route("/createskill").post(upload.single("icon"), createSkill)
router.route("/fetchskill").get(fetchSKill)
router.route("/deleteSkill").post(deleteSkill)



export default router;