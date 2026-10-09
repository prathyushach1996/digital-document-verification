import { Document } from '../models/Document.js';
import { VerificationLog } from '../models/VerificationLog.js';
import { generateDocumentHash, verifyDocumentIntegrity, generateUniqueDocId } from '../utils/crypto.js';
import { generateQRCodeDataUrl } from '../utils/qr.js';

// @desc    Create a new verifiable document
// @route   POST /api/documents
// @access  Private (Issuer / Admin)
export const createDocument = async (req, res) => {
  try {
    const { title, category, description, holder, expiryDate, metadata, customDocId } = req.body;

    if (!title || !holder?.name || !holder?.identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide document title, holder name, and holder identifier'
      });
    }

    const docId = (customDocId && customDocId.trim()) ? customDocId.trim().toUpperCase() : generateUniqueDocId();

    const existingDoc = await Document.findOne({ docId });
    if (existingDoc) {
      return res.status(400).json({
        success: false,
        message: `A document with ID '${docId}' already exists. Please use a unique ID.`
      });
    }

    const issueDate = new Date();

    const issuerData = {
      name: req.user.name,
      organization: req.user.organization || 'Accredited Credential Authority',
      department: req.user.designation || 'Verification & Records',
      user: req.user._id
    };

    // Calculate digital fingerprint (SHA-256)
    const digitalHash = generateDocumentHash({
      docId,
      title,
      category: category || 'Academic',
      holder,
      issuer: issuerData,
      issueDate
    });

    // Generate QR code data URL
    const { qrDataUrl, verifyUrl } = await generateQRCodeDataUrl(docId, {
      hash: digitalHash,
      issueDate
    });

    const newDocument = await Document.create({
      docId,
      title,
      category: category || 'Academic',
      description: description || '',
      holder: {
        name: holder.name,
        identifier: holder.identifier,
        email: holder.email || '',
        phone: holder.phone || '',
        organization: holder.organization || ''
      },
      issuer: issuerData,
      issueDate,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'VALID',
      digitalHash,
      qrCode: qrDataUrl,
      verifyUrl,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Document successfully issued and cryptographically secured',
      document: newDocument
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all documents with search & filter
// @route   GET /api/documents
// @access  Public / Authenticated
export const getDocuments = async (req, res) => {
  try {
    const { search, status, category, holderOnly } = req.query;
    let query = {};

    // Filter by status
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    // Filter by category
    if (category && category !== 'ALL') {
      query.category = category;
    }

    // Holder scope if requested or if user is holder
    if (req.user && (req.user.role === 'holder' || holderOnly === 'true')) {
      query.$or = [
        { 'holder.email': req.user.email },
        { 'holder.user': req.user._id }
      ];
    }

    // Text search across ID, title, holder name, holder identifier
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { docId: searchRegex },
        { title: searchRegex },
        { 'holder.name': searchRegex },
        { 'holder.identifier': searchRegex },
        { 'holder.email': searchRegex }
      ];

      if (query.$or) {
        query = { $and: [query, { $or: searchConditions }] };
      } else {
        query.$or = searchConditions;
      }
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .populate('issuer.user', 'name email organization');

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single document by docId or _id
// @route   GET /api/documents/:id
// @access  Public
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    let doc = await Document.findOne({
      $or: [{ docId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).populate('issuer.user', 'name email organization');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update document metadata / details
// @route   PUT /api/documents/:id
// @access  Private (Issuer / Admin)
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, holder, expiryDate, metadata } = req.body;

    let doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (title) doc.title = title;
    if (category) doc.category = category;
    if (description !== undefined) doc.description = description;
    if (expiryDate !== undefined) doc.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (metadata) doc.metadata = { ...doc.metadata, ...metadata };

    if (holder) {
      if (holder.name) doc.holder.name = holder.name;
      if (holder.identifier) doc.holder.identifier = holder.identifier;
      if (holder.email !== undefined) doc.holder.email = holder.email;
      if (holder.phone !== undefined) doc.holder.phone = holder.phone;
      if (holder.organization !== undefined) doc.holder.organization = holder.organization;
    }

    // Recompute digital fingerprint with updated details
    doc.digitalHash = generateDocumentHash({
      docId: doc.docId,
      title: doc.title,
      category: doc.category,
      holder: doc.holder,
      issuer: doc.issuer,
      issueDate: doc.issueDate
    });

    // Re-generate QR code
    const { qrDataUrl, verifyUrl } = await generateQRCodeDataUrl(doc.docId, {
      hash: doc.digitalHash,
      issueDate: doc.issueDate
    });
    doc.qrCode = qrDataUrl;
    doc.verifyUrl = verifyUrl;

    await doc.save();

    res.json({
      success: true,
      message: 'Document successfully updated and re-signed',
      document: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update document status (VALID, REVOKED, EXPIRED, PENDING)
// @route   PATCH /api/documents/:id/status
// @access  Private (Issuer / Admin)
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusReason } = req.body;

    if (!['VALID', 'REVOKED', 'EXPIRED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = status;
    doc.statusReason = statusReason || (status === 'REVOKED' ? 'Revoked by Issuing Authority' : '');
    await doc.save();

    res.json({
      success: true,
      message: `Document status updated to ${status}`,
      document: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Issuer / Admin)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Clean up verification logs for this doc
    await VerificationLog.deleteMany({ document: doc._id });

    res.json({
      success: true,
      message: 'Document permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify document by Unique ID or QR Code payload
// @route   POST /api/documents/verify
// @access  Public
export const verifyDocument = async (req, res) => {
  try {
    let { identifier, method = 'id_lookup', verifierName = 'Public Verifier' } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Document ID or QR code payload to verify'
      });
    }

    // Clean up input if scanned full URL or JSON
    let cleanId = identifier.trim();

    // If scanned URL like: http://localhost:5173/?verify=DOC-2026-ABCD
    if (cleanId.includes('verify=')) {
      try {
        const urlObj = new URL(cleanId);
        cleanId = urlObj.searchParams.get('verify') || cleanId;
      } catch (e) {
        const match = cleanId.match(/verify=([^&]+)/);
        if (match) cleanId = decodeURIComponent(match[1]);
      }
    }

    // If scanned raw JSON
    if (cleanId.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanId);
        if (parsed.docId) cleanId = parsed.docId;
      } catch (e) {
        // Not JSON, continue with raw
      }
    }

    cleanId = cleanId.toUpperCase();

    // Look up document in MongoDB
    const doc = await Document.findOne({ docId: cleanId });

    if (!doc) {
      return res.status(404).json({
        success: false,
        verified: false,
        status: 'NOT_FOUND',
        message: `No digital credential matches ID "${cleanId}". Document may be counterfeit or invalid.`
      });
    }

    // Cryptographic integrity check (SHA-256)
    const integrity = verifyDocumentIntegrity(doc);

    // Check expiry
    const isExpired = doc.expiryDate && new Date() > new Date(doc.expiryDate);
    const effectiveStatus = isExpired ? 'EXPIRED' : doc.status;

    // Is it fully authentic and valid?
    const isAuthentic = !integrity.isTampered && effectiveStatus === 'VALID';

    // Update document verification metrics
    doc.verificationCount = (doc.verificationCount || 0) + 1;
    doc.lastVerifiedAt = new Date();
    await doc.save();

    // Log the verification attempt
    const log = await VerificationLog.create({
      document: doc._id,
      docId: doc.docId,
      method,
      statusAtVerification: effectiveStatus,
      isIntegrityValid: !integrity.isTampered,
      verifierUser: req.user?._id || null,
      verifierName: req.user?.name || verifierName,
      ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Web Client'
    });

    res.json({
      success: true,
      verified: isAuthentic,
      status: effectiveStatus,
      statusReason: doc.statusReason,
      isTampered: integrity.isTampered,
      integrityDetails: {
        algorithm: 'SHA-256',
        hashMatches: !integrity.isTampered,
        recordedHash: integrity.actualHash,
        verifiedHash: integrity.expectedHash
      },
      document: {
        id: doc._id,
        docId: doc.docId,
        title: doc.title,
        category: doc.category,
        description: doc.description,
        holder: doc.holder,
        issuer: doc.issuer,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        qrCode: doc.qrCode,
        metadata: doc.metadata,
        verificationCount: doc.verificationCount,
        lastVerifiedAt: doc.lastVerifiedAt
      },
      verificationBadge: {
        verificationLogId: log._id,
        verifiedAt: log.createdAt,
        verifier: req.user?.name || verifierName,
        badgeStatus: isAuthentic ? 'VERIFIED_GENUINE' : effectiveStatus
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate tampering with document data to demonstrate tamper detection
// @route   POST /api/documents/:id/tamper-demo
// @access  Public / Testing
export const tamperSimulation = async (req, res) => {
  try {
    const { id } = req.params;
    const { alterField = 'holder.name', newValue = 'HACKED / FORGED IDENTITY' } = req.body;

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Tamper with the field directly without updating the digitalHash!
    if (alterField === 'holder.name') {
      doc.holder.name = newValue;
    } else if (alterField === 'title') {
      doc.title = newValue;
    }

    await doc.save();

    res.json({
      success: true,
      message: `Document content modified to "${newValue}" without altering digitalHash. Integrity test will now fail!`,
      document: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get verification logs / audit trail
// @route   GET /api/documents/:id/logs
// @access  Private / Public
export const getDocumentLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await VerificationLog.find({
      $or: [{ docId: id.toUpperCase() }, { document: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
