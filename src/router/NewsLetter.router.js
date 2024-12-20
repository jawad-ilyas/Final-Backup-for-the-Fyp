import { Router } from "express";
import { createNewsLetter, deleteNewsLetter, fetchNewsLetter } from "../controller/NewsLetter.Controller.js";


const router = Router();


router.route("/createnewsletter").post(createNewsLetter)
router.route("/fetchnewsletter").get(fetchNewsLetter)
router.route("/deletenewsnetter").post(deleteNewsLetter)



export default router;