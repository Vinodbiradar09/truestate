import express from 'express';
import type { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import salesRoutes from './routes/sales.js';
import pool from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sales Management API is running',
    version: '1.0.0',
  });
});

app.use('/api/sales', salesRoutes);


async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('database connected successfully');

    app.listen(PORT, () => {
      console.log(` server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('failed to start server:', error);
    process.exit(1);
  }
}

startServer();
