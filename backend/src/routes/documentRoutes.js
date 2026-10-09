import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  updateDocumentStatus,
  deleteDocument,
  verifyDocument,
  tamperSimulation,
  getDocumentLogs
} from '../controllers/documentController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public verification
router.post('/verify', optionalAuth, verifyDocument);

// Document CRUD
router.route('/')
  .get(optionalAuth, getDocuments)
  .post(protect, authorize('issuer'), createDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(protect, authorize('issuer'), updateDocument)
  .delete(protect, authorize('issuer'), deleteDocument);

router.patch('/:id/status', protect, authorize('issuer'), updateDocumentStatus);
router.get('/:id/logs', getDocumentLogs);
router.post('/:id/tamper-demo', tamperSimulation);

export default router;
