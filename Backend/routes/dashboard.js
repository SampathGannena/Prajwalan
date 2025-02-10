// backend/routes/dashboard.js
import express from 'express';
import {authenticateToken} from '../middleware/authMiddleware.js';


const router = express.Router();

// ✅ Protected Dashboard Route
router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, ${req.user?.name || 'Session User'}!` });
});

export default router;
