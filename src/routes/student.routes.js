import express from 'express';
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    // registerStudent,
    // loginStudent
} from '../controllers/student.controller.js';

const router = express.Router();

router.post('/', createStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
// router.post('/register', registerStudent);
// router.post('/login', loginStudent);

export default router;
