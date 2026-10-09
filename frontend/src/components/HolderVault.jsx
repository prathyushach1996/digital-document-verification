import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  QrCode,
  ShieldCheck,
  Printer,
  Copy,
  ExternalLink,
  Award,
  Calendar,
  Building,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const HolderVault = ({
  currentUser,
  token,
  onVerifyDoc,
  onViewCertificate,
  showToast
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchHolderDocs = async () => {
      setLoading(true);
      try {
        // Fetch documents scoped to this holder or default sample holder
        const res = await api.getDocuments({
          holderOnly: currentUser?.role === 'holder' ? 'true' : 'false'
        }, token);

        if (res.success) {
          // If logged in as holder, show matching docs, else show all with holder view
          setDocuments(res.documents);
        }
      } catch (err) {
        showToast('Error loading wallet credentials: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHolderDocs();
  }, [currentUser, token]);

  const copyDocId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied ${id} to clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Vault Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
          }}>
            <Award size={36} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
                {currentUser ? `${currentUser.name}'s Credential Vault` : "Holder Digital Credential Wallet"}
              </h1>
              <span className="badge badge-valid">Self-Sovereign Identity</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Present your cryptographically sealed QR codes to employers, inspectors, and institutions for zero-friction verification.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credentials Stored</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>{documents.length}</div>
          </div>
        </div>
      </div>

      {/* Grid of Credentials */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading your credential certificates from MongoDB...
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>No Issued Documents Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            Switch to the Issuer Desk tab to issue a new digital certificate or credential.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top Accent Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: doc.status === 'VALID'
                  ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                  : doc.status === 'REVOKED'
                  ? '#f43f5e'
                  : '#94a3b8'
              }} />

              <div>
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span className="badge badge-valid" style={{
                    fontSize: '0.7rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc'
                  }}>
                    {doc.category}
                  </span>
                  <span className={`badge badge-${doc.status.toLowerCase()}`}>
                    {doc.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
                  {doc.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px', minHeight: '38px' }}>
                  {doc.description || 'Verified institutional credential issued under digital signature standard.'}
                </p>

                {/* Key attributes */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique ID</span>
                    <span className="font-mono" style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '600' }}>
                      {doc.docId}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Holder ID</span>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {doc.holder?.identifier}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issuer</span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', textAlign: 'right', maxWidth: '170px' }}>
                      {doc.issuer?.organization || doc.issuer?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setActiveQrModal(doc)}
                >
                  <QrCode size={15} />
                  <span>Show QR Code</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onViewCertificate && onViewCertificate(doc)}
                  title="View Certificate"
                >
                  <Printer size={15} />
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onVerifyDoc && onVerifyDoc(doc.docId)}
                  title="Verify Live"
                >
                  <ShieldCheck size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL SCREEN QR PRESENTATION MODAL */}
      {activeQrModal && (
        <div className="modal-overlay" onClick={() => setActiveQrModal(null)}>
          <div
            className="glass-panel-elevated"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '36px',
              textAlign: 'center',
              borderRadius: '24px'
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={14} /> Ready for Inspection
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
              {activeQrModal.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '24px' }}>
              Holder: <strong style={{ color: '#fff' }}>{activeQrModal.holder?.name}</strong> ({activeQrModal.holder?.identifier})
            </p>

            {/* High Contrast QR Code Display */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '20px',
              display: 'inline-block',
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              marginBottom: '20px'
            }}>
              <img
                src={activeQrModal.qrCode}
                alt="Document Verification QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '10px 14px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span className="font-mono" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '700' }}>
                {activeQrModal.docId}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyDocId(activeQrModal.docId)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {copiedId === activeQrModal.docId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedId === activeQrModal.docId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveQrModal(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const win = window.open('', '_blank');
                  win.document.write(`<img src="${activeQrModal.qrCode}" style="width:300px; display:block; margin:40px auto;"/><h2 style="text-align:center; font-family:sans-serif;">${activeQrModal.docId}</h2>`);
                }}
              >
                Download / Print QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
