import db from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         department:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /teachers/register:
 *   post:
 *     summary: Register a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Teacher already exists
 *       500:
 *         description: Server error
 */
export const registerTeacher = async (req, res) => {
    const { name, department, email, password } = req.body;

    if (!name || !department || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {
        const query = await db.Teacher.findOne({
            where: { name: name, department: department, email: email },
            attributes: ['id']
        });
        if (query) {
            return res.status(409).json({ success: false, message: 'Teacher already exists' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newTeacher = await db.Teacher.create({
            name: name,
            department: department,
            email: email,
            password_hash: hashedPassword
        });
        return res.status(201).json({
            success: true,
            message: 'Teacher registered successfully',
            data: {
                id: newTeacher.id,
                name: newTeacher.name,
                department: newTeacher.department,
                email: newTeacher.email
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
/**
 * @swagger
 * /teachers/login:
 *   post:
 *     summary: Login as a teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export const loginTeacher = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    } 
    try {
        const teacher = await db.Teacher.findOne({
            where: { email: email},
            attributes: ['id', 'email', 'password_hash']
        })

        if (!teacher) {
            return res.status(401).json({ success: false, message: 'Password or email already exist' });
        }

        const isMatch = await bcrypt.compare(password, teacher.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

        const payload = { 
            email: teacher.email, 
            name: teacher.name,
            id: teacher.id
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN, {
            expiresIn: '1h'
        })

        return res.json({ success: true, accessToken: token });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
    
}

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       500:
 *         description: Server error
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order based on createdAt
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Include related data (e.g., courseId)
 *     responses:
 *       200:
 *         description: List of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teacher'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const getAllTeachers = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort ? req.query.sort.toUpperCase() : 'ASC';
    const populate = req.query.populate ? req.query.populate.split(',') : [];

    // Validate query parameters
    if (limit <= 0 || page <= 0) {
        return res.status(400).json({ error: 'Limit and page must be positive integers.' });
    }
    if (!['ASC', 'DESC'].includes(sort)) {
        return res.status(400).json({ error: 'Invalid sort value. Use "asc" or "desc".' });
    }
    const validRelations = ['courseId'];
    const invalidRelations = populate.filter(rel => !validRelations.includes(rel));
    if (invalidRelations.length > 0) {
        return res.status(400).json({ error: `Invalid populate values: ${invalidRelations.join(', ')}` });
    }

    // Build include array for eager loading
    const include = [];
    if (populate.includes('courseId')) {
        include.push({ model: db.Course, as: 'Courses' });
    }

    try {
        const total = await db.Teacher.count();
        const teachers = await db.Teacher.findAll({
            include: include,
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', sort]]
        });
        res.json({
            data: teachers,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Include related data (e.g., courseId)
 *     responses:
 *       200:
 *         description: Teacher found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const getTeacherById = async (req, res) => {
    const populate = req.query.populate ? req.query.populate.split(',') : [];

    // Validate populate parameter
    const validRelations = ['courseId'];
    const invalidRelations = populate.filter(rel => !validRelations.includes(rel));
    if (invalidRelations.length > 0) {
        return res.status(400).json({ error: `Invalid populate values: ${invalidRelations.join(', ')}` });
    }

    // Build include array
    const include = [];
    if (populate.includes('courseId')) {
        include.push({ model: db.Course, as: 'Courses' });
    }

    try {
        const teacher = await db.Teacher.findByPk(req.params.id, { include });
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};