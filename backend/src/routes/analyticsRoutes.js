import express from 'express';
import { getSystemSummary } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getSystemSummary);

export default router;
