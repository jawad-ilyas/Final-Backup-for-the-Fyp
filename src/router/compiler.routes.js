// routes/compiler.routes.js
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { runStudentCode } from "../controllers/compiler.controllers.js";
import { runStudentCodeJudge0 } from "../controllers/judge0.controllers.js";

const router = Router();

// POST /api/v1/compiler/run
// router.post("/run", protect, runStudentCode);
router.post("/run", runStudentCodeJudge0);  

export default router;
