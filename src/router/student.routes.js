// routes/student.routes.js
import { Router } from 'express';
import {
    getStudentById,
    updateStudent,
    removeStudent,
} from '../controllers/student.controllers.js';
// import protect or adminCheck if needed

const router = Router();

/**
 * GET /api/v1/students/:id => getStudentById
 */
router.get('/:id', getStudentById);

/**
 * PUT /api/v1/students/:id => updateStudent
 */
router.put('/:id', updateStudent);

/**
 * DELETE /api/v1/students/:id => removeStudent
 */
router.delete('/:id', removeStudent);

export default router;
