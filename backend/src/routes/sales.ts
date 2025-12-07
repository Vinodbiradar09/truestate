import express from 'express';
import { getSalesController, getFilterOptionsController } from '../controllers/salesController.js';

const router = express.Router();

router.get('/', getSalesController);

router.get('/filters', getFilterOptionsController);

export default router;

