import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Copy,
  Lock,
  Unlock
} from 'lucide-react';
import { api } from '../services/api';

export const TamperLab = ({ onVerifyDoc, showToast }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [currentDoc, setCurrentDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [tamperedField, setTamperedField] = useState('holder.name');
  const [forgedValue, setForgedValue] = useState('FORGED IDENTITY (MALICIOUS ACTOR)');

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await api.getDocuments();
        if (res.success && res.documents.length > 0) {
          setDocuments(res.documents);
          // Pick the first valid doc by default
          const validDoc = res.documents.find((d) => d.status === 'VALID') || res.documents[0];
          setSelectedDocId(validDoc.docId);
          setCurrentDoc(validDoc);
        }
      } catch (err) {
        console.error('Error loading documents for tamper lab:', err);
      }
    };
    loadDocs();
  }, []);

  const handleSelectDoc = async (docId) => {
    setSelectedDocId(docId);
    setTestResult(null);
    try {
      const res = await api.getDocumentById(docId);
      if (res.success) {
        setCurrentDoc(res.document);
      }
    } catch (err) {
      showToast('Error loading document: ' + err.message, 'error');
    }
  };

  // Simulate Tampering
  const handleSimulateTamper = async () => {
    if (!currentDoc) return;
    setLoading(true);
    try {
      const res = await api.tamperDemo(currentDoc._id, tamperedField, forgedValue);
      if (res.success) {
        showToast('Document record artificially modified in database without re-signing hash!', 'error');
        setCurrentDoc(res.document);
        // Automatically run verification to show tamper detection
        const verifyRes = await api.verifyDocument(currentDoc.docId, 'id_lookup', 'Tamper Lab Inspector');
        setTestResult(verifyRes);
      }
    } catch (err) {
      showToast('Error simulating tamper: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Restore Original Clean State
  const handleRestoreDoc = async () => {
    if (!currentDoc) return;
    setLoading(true);
    try {
      // Re-update to valid original name
      const res = await api.updateDocument(
        currentDoc._id,
        {
          holder: {
            name: 'Alexander Wright',
            identifier: currentDoc.holder?.identifier || 'STU-992014'
          }
        },
        null
      );
      if (res.success) {
        showToast('Document restored and re-signed with genuine cryptographic seal!', 'success');
        setCurrentDoc(res.document);
        // Verify again
        const verifyRes = await api.verifyDocument(currentDoc.docId, 'id_lookup', 'Tamper Lab Inspector');
        setTestResult(verifyRes);
      }
    } catch (err) {
      showToast('Error restoring: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(244, 63, 94, 0.2)',
          border: '1px solid #f43f5e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldAlert size={36} color="#f43f5e" />
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
              Cryptographic Tamper-Proof Testing Lab
            </h1>
            <span className="badge badge-revoked">Security Sandbox</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Demonstrates why forged or altered documents fail verification instantly. Even modifying a single letter in the holder name causes the SHA-256 fingerprint check to fail!
          </p>
        </div>
      </div>

      {/* Target Document Selector */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          1. Select Target Document to Audit
        </h3>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {documents.map((doc) => (
            <button
              key={doc.docId}
              className={`btn btn-sm ${selectedDocId === doc.docId ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSelectDoc(doc.docId)}
              style={{ fontSize: '0.8rem' }}
            >
              <span className="font-mono">{doc.docId}</span>
              <span>- {doc.title.substring(0, 20)}...</span>
            </button>
          ))}
        </div>

        {currentDoc && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document Title</div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{currentDoc.title}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Holder Name in DB</div>
                <div style={{
                  fontWeight: '700',
                  color: currentDoc.holder?.name?.includes('FORGED') ? '#f43f5e' : '#10b981'
                }}>
                  {currentDoc.holder?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stored SHA-256 Fingerprint</div>
                <code className="font-mono" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                  {currentDoc.digitalHash?.substring(0, 20)}...
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tampering Controls */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          2. Simulate Malicious Data Alteration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Field to Tamper
            </label>
            <select
              className="form-input"
              value={tamperedField}
              onChange={(e) => setTamperedField(e.target.value)}
            >
              <option value="holder.name">Holder Name</option>
              <option value="title">Document Title</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Forged Value (Database Modification without Private Key)
            </label>
            <input
              type="text"
              className="form-input"
              value={forgedValue}
              onChange={(e) => setForgedValue(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-danger"
            onClick={handleSimulateTamper}
            disabled={loading}
          >
            <ShieldAlert size={18} />
            <span>Simulate Forgery & Test Verification</span>
          </button>

          <button
            className="btn btn-success"
            onClick={handleRestoreDoc}
            disabled={loading}
          >
            <CheckCircle2 size={18} />
            <span>Restore Authentic Original & Re-Sign</span>
          </button>
        </div>
      </div>

      {/* Verification Integrity Test Result */}
      {testResult && (
        <div className="glass-panel-elevated" style={{
          padding: '28px',
          border: testResult.isTampered
            ? '2px solid rgba(244, 63, 94, 0.8)'
            : '2px solid rgba(16, 185, 129, 0.8)',
          borderRadius: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: testResult.isTampered ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'
            }}>
              {testResult.isTampered ? (
                <ShieldAlert size={30} color="#f43f5e" />
              ) : (
                <ShieldCheck size={30} color="#10b981" />
              )}
            </div>

            <div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: '800',
                color: testResult.isTampered ? '#f43f5e' : '#10b981'
              }}>
                {testResult.isTampered
                  ? 'CRITICAL ALERT: CRYPTOGRAPHIC HASH MISMATCH DETECTED!'
                  : 'INTEGRITY CONFIRMED: HASH PERFECTLY MATCHES ISSUER SEAL'}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {testResult.isTampered
                  ? 'The document payload has been modified post-issuance. The computed SHA-256 checksum does not match the immutable digital signature!'
                  : 'Bit-for-bit authenticity verified across all canonical record attributes.'}
              </p>
            </div>
          </div>

          {/* Hash Comparison Table */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recorded Issuer Fingerprint (in DB)
              </div>
              <code className="font-mono" style={{ fontSize: '0.82rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                {testResult.integrityDetails?.recordedHash}
              </code>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Dynamically Recalculated Hash (from current document contents)
              </div>
              <code className="font-mono" style={{
                fontSize: '0.82rem',
                color: testResult.isTampered ? '#f43f5e' : '#10b981',
                wordBreak: 'break-all',
                fontWeight: '700'
              }}>
                {testResult.integrityDetails?.verifiedHash}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
