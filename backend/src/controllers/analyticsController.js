import { Document } from '../models/Document.js';
import { VerificationLog } from '../models/VerificationLog.js';

export const getSystemSummary = async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments();
    const validDocs = await Document.countDocuments({ status: 'VALID' });
    const revokedDocs = await Document.countDocuments({ status: 'REVOKED' });
    const expiredDocs = await Document.countDocuments({ status: 'EXPIRED' });
    const pendingDocs = await Document.countDocuments({ status: 'PENDING' });

    const totalVerifications = await VerificationLog.countDocuments();

    // Category breakdown
    const categoryStats = await Document.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Recent 10 verification logs
    const recentVerifications = await VerificationLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('document', 'title holder.name');

    // Recent issued documents
    const recentIssued = await Document.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('docId title category status holder.name issueDate');

    res.json({
      success: true,
      summary: {
        totalDocs,
        validDocs,
        revokedDocs,
        expiredDocs,
        pendingDocs,
        totalVerifications
      },
      categoryStats,
      recentVerifications,
      recentIssued
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
