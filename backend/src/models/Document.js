import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Identity', 'Medical', 'Legal', 'Employment', 'Government', 'Other'],
      default: 'Academic'
    },
    description: {
      type: String,
      default: ''
    },
    holder: {
      name: {
        type: String,
        required: [true, 'Holder name is required'],
        trim: true
      },
      identifier: {
        type: String,
        required: [true, 'Holder unique ID or National ID is required'],
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      },
      organization: {
        type: String,
        trim: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    issuer: {
      name: {
        type: String,
        required: true
      },
      organization: {
        type: String,
        required: true
      },
      department: {
        type: String,
        default: 'Verification & Records'
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    expiryDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['VALID', 'REVOKED', 'EXPIRED', 'PENDING'],
      default: 'VALID'
    },
    statusReason: {
      type: String,
      default: ''
    },
    digitalHash: {
      type: String,
      required: true
    },
    qrCode: {
      type: String, // base64 data url
      required: true
    },
    verifyUrl: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    verificationCount: {
      type: Number,
      default: 0
    },
    lastVerifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Virtual to check if currently expired
documentSchema.virtual('isCurrentlyExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > new Date(this.expiryDate);
});

export const Document = mongoose.model('Document', documentSchema);
