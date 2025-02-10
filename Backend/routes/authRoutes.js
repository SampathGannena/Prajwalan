import express from 'express';
import { login, logout } from '../controllers/authController.js';
import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Welcome, User ID: ${req.session.userId}`);
});
router.post('/std_signup', signup);
export default router;
