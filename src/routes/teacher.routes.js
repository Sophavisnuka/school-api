import express from 'express';
import {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    registerTeacher,
    loginTeacher
} from '../controllers/teacher.controller.js';
import validation from '../middleware/validation.js';
import { ro } from '@faker-js/faker';
const router = express.Router();

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

router.use(validation); // Apply validation middleware to all routes below  

router.get('/checkTeacherAuth', (req, res) => {
    res.json({ success: true, user: req.user });
});

router.post('/', createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);


export default router;
