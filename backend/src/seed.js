import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Document } from './models/Document.js';
import { VerificationLog } from './models/VerificationLog.js';
import { generateDocumentHash } from './utils/crypto.js';
import { generateQRCodeDataUrl } from './utils/qr.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/digital_doc_verification');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await User.deleteMany({});
    await Document.deleteMany({});
    await VerificationLog.deleteMany({});
    console.log('[Seed] Cleared existing records.');

    // 1. Create Demo Users
    const issuerUser = await User.create({
      name: 'Dr. Eleanor Vance',
      email: 'issuer@verify.org',
      password: 'password123',
      role: 'issuer',
      organization: 'Apex National Accreditation & University Registrar',
      designation: 'Dean of Records & Issuing Authority'
    });

    const verifierUser = await User.create({
      name: 'Marcus Sterling',
      email: 'verifier@company.com',
      password: 'password123',
      role: 'verifier',
      organization: 'Global Compliance & Talent Verification Inc.',
      designation: 'Lead Identity & Audit Officer'
    });

    const holderUser = await User.create({
      name: 'Alexander Wright',
      email: 'holder@citizen.org',
      password: 'password123',
      role: 'holder',
      organization: 'Institute of Advanced Technology',
      designation: 'Software Systems Engineer'
    });

    console.log('[Seed] Created demo users (Issuer, Verifier, Holder).');

    // 2. Sample Documents to seed
    const rawDocuments = [
      {
        docId: 'DOC-2026-CS8821',
        title: 'Bachelor of Science in Computer Science & AI',
        category: 'Academic',
        description: 'Conferred with highest distinction for mastering algorithms, distributed systems, and neural networks.',
        holder: {
          name: 'Alexander Wright',
          identifier: 'STU-992014',
          email: 'holder@citizen.org',
          phone: '+1 (555) 019-4822',
          organization: 'Apex National University',
          user: holderUser._id
        },
        issuerData: {
          name: issuerUser.name,
          organization: issuerUser.organization,
          department: 'Academic Registry & Governance',
          user: issuerUser._id
        },
        issueDate: new Date('2025-06-15T10:00:00Z'),
        expiryDate: null,
        status: 'VALID',
        statusReason: '',
        metadata: {
          'Cumulative GPA': '3.94 / 4.00',
          'Honors Distinction': 'Summa Cum Laude',
          'Faculty Advisor': 'Prof. Julian Thorne',
          'Registry Folio': 'REG-2025-VOL-18'
        }
      },
      {
        docId: 'DOC-2026-MED4409',
        title: 'Board Certified Physician & Surgeon License',
        category: 'Medical',
        description: 'Certified practitioner licensed for specialized inpatient diagnostics and invasive clinical care.',
        holder: {
          name: 'Dr. Sophia Ramirez',
          identifier: 'MED-LIC-88412',
          email: 'sophia.ramirez@medhealth.org',
          phone: '+1 (555) 438-9901',
          organization: 'Metropolitan Health Systems'
        },
        issuerData: {
          name: issuerUser.name,
          organization: 'National Medical Council & Licensing Board',
          department: 'Medical Standards Bureau',
          user: issuerUser._id
        },
        issueDate: new Date('2024-03-20T08:30:00Z'),
        expiryDate: new Date('2028-03-20T08:30:00Z'),
        status: 'VALID',
        statusReason: '',
        metadata: {
          'Specialization': 'Cardiothoracic Surgery',
          'DEA Registration': 'BD-8849102-X',
          'Accredited Hospital': 'St. Jude General'
        }
      },
      {
        docId: 'DOC-2026-GOV1092',
        title: 'National Citizen Digital Identity Credential',
        category: 'Identity',
        description: 'Cryptographically verified citizen identity document with biometric assurance level 3.',
        holder: {
          name: 'Alexander Wright',
          identifier: 'NAT-ID-78192039',
          email: 'holder@citizen.org',
          phone: '+1 (555) 019-4822',
          organization: 'Federal Civil Registry',
          user: holderUser._id
        },
        issuerData: {
          name: 'Federal Department of Civil Affairs',
          organization: 'Government Digital Identity Authority',
          department: 'Bureau of Digital Credentials',
          user: issuerUser._id
        },
        issueDate: new Date('2024-01-10T12:00:00Z'),
        expiryDate: new Date('2034-01-10T12:00:00Z'),
        status: 'VALID',
        statusReason: '',
        metadata: {
          'Nationality': 'United States',
          'Place of Issue': 'Washington, D.C.',
          'Blood Group': 'O+'
        }
      },
      {
        docId: 'DOC-2026-LAW3321',
        title: 'Commercial Land Title & Registered Property Deed',
        category: 'Legal',
        description: 'Official deed conveyance registration for designated commercial commercial lot parcel.',
        holder: {
          name: 'Elena Rostova',
          identifier: 'DEED-REG-2024-77',
          email: 'elena.rostova@properties.com',
          phone: '+1 (555) 772-3004',
          organization: 'Apex Realty Holdings'
        },
        issuerData: {
          name: issuerUser.name,
          organization: 'Municipal Land Title Registry Office',
          department: 'Real Property Conveyance',
          user: issuerUser._id
        },
        issueDate: new Date('2023-11-04T14:15:00Z'),
        expiryDate: null,
        status: 'REVOKED',
        statusReason: 'Revoked by High Land Court following boundary re-survey settlement order #2024-B9',
        metadata: {
          'Parcel Number': 'SEC-88-LOT-14B',
          'Area': '2.45 Acres',
          'Zoning': 'Commercial C-2'
        }
      },
      {
        docId: 'DOC-2026-EXP7712',
        title: 'Defense Industrial Security Clearance Certificate',
        category: 'Employment',
        description: 'Tier 5 special access authorization clearance for classified aerospace defense systems.',
        holder: {
          name: 'David Miller',
          identifier: 'DOD-SEC-88129',
          email: 'dmiller@aerodefense.org',
          phone: '+1 (555) 609-1123',
          organization: 'Titan Defense Systems'
        },
        issuerData: {
          name: issuerUser.name,
          organization: 'Defense Security Service Authority',
          department: 'Industrial Clearance Division',
          user: issuerUser._id
        },
        issueDate: new Date('2023-01-15T09:00:00Z'),
        expiryDate: new Date('2025-01-15T09:00:00Z'), // Past date => Expired
        status: 'EXPIRED',
        statusReason: 'Credential expired on January 15, 2025. Recertification required.',
        metadata: {
          'Clearance Level': 'Top Secret / SCI',
          'Investigating Agency': 'DCSA Special Investigations'
        }
      }
    ];

    const createdDocs = [];

    for (const doc of rawDocuments) {
      // Calculate authentic SHA-256 fingerprint
      const digitalHash = generateDocumentHash({
        docId: doc.docId,
        title: doc.title,
        category: doc.category,
        holder: doc.holder,
        issuer: doc.issuerData,
        issueDate: doc.issueDate
      });

      // Generate verifiable QR code
      const { qrDataUrl, verifyUrl } = await generateQRCodeDataUrl(doc.docId, {
        hash: digitalHash,
        issueDate: doc.issueDate
      });

      const docRecord = await Document.create({
        docId: doc.docId,
        title: doc.title,
        category: doc.category,
        description: doc.description,
        holder: doc.holder,
        issuer: doc.issuerData,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        status: doc.status,
        statusReason: doc.statusReason,
        digitalHash,
        qrCode: qrDataUrl,
        verifyUrl,
        metadata: doc.metadata,
        verificationCount: Math.floor(Math.random() * 8) + 1,
        lastVerifiedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3))
      });

      createdDocs.push(docRecord);

      // Create a couple verification log entries for each
      await VerificationLog.create({
        document: docRecord._id,
        docId: docRecord.docId,
        method: Math.random() > 0.5 ? 'qr_scan' : 'id_lookup',
        statusAtVerification: docRecord.status,
        isIntegrityValid: true,
        verifierUser: verifierUser._id,
        verifierName: verifierUser.name,
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'
      });
    }

    console.log(`[Seed] Seeded ${createdDocs.length} verifiable documents with SHA-256 fingerprints & QR codes.`);
    console.log('\n=============================================');
    console.log('DEMO ACCOUNTS READY:');
    console.log('1. Issuer/Admin: issuer@verify.org / password123');
    console.log('2. Verifier:     verifier@company.com / password123');
    console.log('3. Holder:       holder@citizen.org / password123');
    console.log('=============================================\n');

    await mongoose.disconnect();
    console.log('[Seed] Done!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
