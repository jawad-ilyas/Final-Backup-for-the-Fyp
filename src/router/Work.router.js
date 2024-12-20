import { AddWork, DeleteWork, ShowWork, UpdateWork } from "../controller/Work.controller.js";
import { Router } from "express";
import { upload } from "../middlerware/multer.middleware.js";


const router = Router();

router.route("/addWork").post(upload.single("avatar"), AddWork)
router.route("/showWork").get(ShowWork)
router.route("/DeleteWork").post(DeleteWork)
router.route("/UpdateWork").post(upload.single("avatar"), UpdateWork)


export default router;