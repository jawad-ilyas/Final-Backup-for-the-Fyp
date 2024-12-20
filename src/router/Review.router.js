import { Router } from "express";
import { createReview, deleteReview, fetchReview, updateReview } from "../controller/Review.Controller.js";
import { upload } from "../middlerware/multer.middleware.js";



const router = Router();



router.route("/createReview").post(upload.single("reviewImage"),createReview)
router.route("/fetchReview").get(fetchReview)
router.route("/deleteReview").post(deleteReview)
router.route("/updateReview").post(updateReview)



export default router