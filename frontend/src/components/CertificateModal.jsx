import React from 'react';
import { ShieldCheck, Award, Printer, X, QrCode } from 'lucide-react';

export const CertificateModal = ({ document: doc, onClose }) => {
  if (!doc) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '24px'
        }}
      >
        {/* Modal Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#eab308" />
            <span style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
              Official Verifiable Credential Certificate
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div
          id="printable-certificate"
          style={{
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '16px',
            padding: '40px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '8px double #1e293b',
            fontFamily: "'Plus Jakarta Sans', Georgia, serif"
          }}
        >
          {/* Watermark Logo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.04,
            pointerEvents: 'none'
          }}>
            <ShieldCheck size={380} color="#000" />
          </div>

          {/* Top Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4f46e5',
              fontWeight: '800',
              fontSize: '1rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              <ShieldCheck size={22} color="#4f46e5" />
              {doc.issuer?.organization || 'Apex National Credential Authority'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Official Institutional Registry • Department of Verified Records
            </div>
            <h1 style={{
              fontSize: '1.9rem',
              fontWeight: '800',
              color: '#0f172a',
              marginTop: '12px',
              letterSpacing: '-0.02em'
            }}>
              CERTIFICATE OF RECOGNITION
            </h1>
          </div>

          {/* Body Statement */}
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <p style={{ fontSize: '0.95rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
              This is to officially certify that
            </p>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '800',
              color: '#1e1b4b',
              margin: '8px 0',
              letterSpacing: '-0.01em',
              borderBottom: '1px solid #cbd5e1',
              display: 'inline-block',
              paddingBottom: '4px'
            }}>
              {doc.holder?.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace', marginTop: '4px' }}>
              Holder Identifier: {doc.holder?.identifier}
            </div>

            <p style={{ fontSize: '0.95rem', color: '#475569', margin: '18px auto', maxWidth: '560px', lineHeight: 1.6 }}>
              Has met all requirements and regulations for the verified credential of
            </p>

            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: '700',
              color: '#4338ca',
              background: '#f1f5f9',
              display: 'inline-block',
              padding: '8px 24px',
              borderRadius: '8px'
            }}>
              {doc.title}
            </h3>

            {doc.description && (
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '12px', maxWidth: '520px', margin: '12px auto' }}>
                "{doc.description}"
              </p>
            )}

            {/* Dynamic Metadata Fields */}
            {doc.metadata && Object.keys(doc.metadata).length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '16px',
                flexWrap: 'wrap'
              }}>
                {Object.entries(doc.metadata).map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      fontSize: '0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: '#334155'
                    }}
                  >
                    <strong>{k}:</strong> {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Signatures & QR Code */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '2px solid #e2e8f0',
            paddingTop: '24px',
            marginTop: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Signature Line */}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: "'Brush Script MT', cursive, serif",
                fontSize: '1.8rem',
                color: '#1e293b',
                lineHeight: 1,
                marginBottom: '4px'
              }}>
                {doc.issuer?.name || 'Dr. Eleanor Vance'}
              </div>
              <div style={{ width: '180px', height: '1px', background: '#94a3b8', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>
                Authorized Registrar & Signature
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Date of Issue: {new Date(doc.issueDate).toLocaleDateString()}
              </div>
            </div>

            {/* Status Seal */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '3px solid #eab308',
                background: '#fefce8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)',
                margin: '0 auto 6px auto'
              }}>
                <Award size={26} color="#ca8a04" />
                <span style={{ fontSize: '0.55rem', fontWeight: '800', color: '#a16207', letterSpacing: '0.05em' }}>
                  OFFICIAL
                </span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                color: doc.status === 'VALID' ? '#059669' : '#dc2626'
              }}>
                STATUS: {doc.status}
              </div>
            </div>

            {/* Live Verifiable QR Code */}
            <div style={{ textAlign: 'right' }}>
              {doc.qrCode && (
                <div style={{
                  display: 'inline-block',
                  background: '#fff',
                  padding: '6px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px'
                }}>
                  <img
                    src={doc.qrCode}
                    alt="Scan to Verify"
                    style={{ width: '92px', height: '92px', display: 'block' }}
                  />
                </div>
              )}
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#475569', marginTop: '4px' }}>
                Scan to Verify Authenticity
              </div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#64748b' }}>
                Doc ID: {doc.docId}
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Ribbon */}
          <div style={{
            marginTop: '20px',
            paddingTop: '8px',
            borderTop: '1px dashed #cbd5e1',
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            color: '#64748b',
            wordBreak: 'break-all',
            textAlign: 'center'
          }}>
            SHA-256 Fingerprint: {doc.digitalHash}
          </div>
        </div>
      </div>
    </div>
  );
};
