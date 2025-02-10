// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { authenticateToken } from './middleware/authMiddleware.js';
// import authenticateUser from './middleware/authMiddleware.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://127.0.0.1:5502', // ✅ Allow requests from your frontend
    credentials: true
  }));
app.use(express.json());

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Protected Routes (require authentication)
app.use('/api/protected', authenticateToken);

// API Routes
app.use('/api', studentRoutes);
app.use('/api', dashboardRoutes);


// Server Listening
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));