import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    docId: {
      type: String,
      required: true
    },
    method: {
      type: String,
      enum: ['qr_scan', 'id_lookup', 'camera_live_scan'],
      default: 'id_lookup'
    },
    statusAtVerification: {
      type: String,
      required: true
    },
    isIntegrityValid: {
      type: Boolean,
      default: true
    },
    verifierUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifierName: {
      type: String,
      default: 'Public Verifier'
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'Web Browser'
    }
  },
  {
    timestamps: true
  }
);

export const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);
