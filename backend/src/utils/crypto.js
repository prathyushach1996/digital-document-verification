import crypto from 'crypto';

/**
 * Generates a deterministic SHA-256 fingerprint for document content
 */
export const generateDocumentHash = (docData) => {
  const canonicalString = [
    (docData.docId || '').trim(),
    (docData.title || '').trim(),
    (docData.category || '').trim(),
    (docData.holder?.name || '').trim(),
    (docData.holder?.identifier || '').trim(),
    (docData.issuer?.name || '').trim(),
    new Date(docData.issueDate || Date.now()).toISOString().split('T')[0]
  ].join('|');

  return crypto.createHash('sha256').update(canonicalString).digest('hex');
};

/**
 * Verifies if document hash matches current fields (tamper detection)
 */
export const verifyDocumentIntegrity = (document) => {
  const calculatedHash = generateDocumentHash({
    docId: document.docId,
    title: document.title,
    category: document.category,
    holder: document.holder,
    issuer: document.issuer,
    issueDate: document.issueDate
  });

  return {
    isTampered: calculatedHash !== document.digitalHash,
    expectedHash: calculatedHash,
    actualHash: document.digitalHash
  };
};

/**
 * Generates unique human-readable Document Identifier
 * e.g., DOC-2026-X8F9A1
 */
export const generateUniqueDocId = (prefix = 'DOC') => {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${year}-${randomPart}`;
};
