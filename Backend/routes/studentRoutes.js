import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import {authenticateToken} from '../middleware/authMiddleware.js'; // ✅ Correct Import


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ✅ Signup Route
router.post('/std_signup', upload.single('photo'), async (req, res) => {
    try {
        const { firstName, lastName, adminID, email, dob, phone, gender, university, address, city, zipCode, country, domain, education, graduationYear, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            firstName,
            lastName,
            adminID,
            email,
            dob,
            phone,
            gender,
            university,
            address,
            city,
            zipCode,
            country,
            domain,
            education,
            graduationYear,
            photo: req.file ? req.file.path : '',
            password: hashedPassword
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: 'Sign-in successful',
            token,
            student: { id: student._id, email: student.email, name: `${student.firstName} ${student.lastName}` }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ✅ Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: 'Email not found' });

        console.log(`Password reset instructions sent to: ${email}`);
        res.status(200).json({ message: 'Password reset instructions sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
});

// ✅ Dynamic Dashboard Route
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json({
            name: `${student.firstName} ${student.lastName}`,
            streak: student.streak || 0,
            score: student.score || 0,
            course: { title: "Web Development", currentTopic: "React Basics" },
            videos: [
                { title: "Intro to React", part: "Part 1", videoUrl: "https://example.com/video1", pdfUrl: "https://example.com/notes1.pdf" },
                { title: "Advanced React", part: "Part 2", videoUrl: "https://example.com/video2", pdfUrl: "https://example.com/notes2.pdf" }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.' });
    }
});

export default router;
