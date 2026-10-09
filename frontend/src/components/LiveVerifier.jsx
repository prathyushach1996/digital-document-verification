import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Printer,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../services/api';

export const LiveVerifier = ({ defaultDocId, onViewCertificate }) => {
  const [docIdInput, setDocIdInput] = useState(defaultDocId || '');
  const [activeScanMode, setActiveScanMode] = useState('input'); // 'input' | 'upload' | 'camera'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Auto-verify if defaultDocId provided
  useEffect(() => {
    if (defaultDocId) {
      setDocIdInput(defaultDocId);
      performVerification(defaultDocId, 'id_lookup');
    }
  }, [defaultDocId]);

  // Clean up camera on unmount or mode switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && cameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
      setCameraActive(false);
    }
  };

  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-live');
      html5QrCodeRef.current = html5QrCode;
      setCameraActive(true);

      const qrCodeSuccessCallback = (decodedText) => {
        stopCamera();
        performVerification(decodedText, 'camera_live_scan');
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // ignore scan frame misses
        }
      );
    } catch (err) {
      console.error('Camera start failed:', err);
      setError('Unable to access webcam. Please check camera permissions or upload QR code file instead.');
      setCameraActive(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-scan-temp');
      const decodedResult = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      performVerification(decodedResult, 'qr_scan');
    } catch (err) {
      console.error('Failed to parse QR image:', err);
      setError('Could not detect a valid QR code in this image. Please upload a clear QR code.');
      setLoading(false);
    }
  };

  const performVerification = async (identifier, method = 'id_lookup') => {
    if (!identifier || !identifier.trim()) {
      setError('Please enter a Document ID or scan a QR code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.verifyDocument(identifier.trim(), method, 'DocuTrust Inspector');
      setLoading(false);

      if (res.success) {
        setResult(res);
        if (res.verified) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        setResult(res);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Verification network failure. Please verify backend is running.');
    }
  };

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const quickVerifyPresets = [
    { id: 'DOC-2026-CS8821', label: '🎓 Academic Degree (Valid)', color: '#10b981' },
    { id: 'DOC-2026-MED4409', label: '🩺 Medical License (Valid)', color: '#10b981' },
    { id: 'DOC-2026-LAW3321', label: '📜 Property Deed (Revoked)', color: '#f43f5e' },
    { id: 'DOC-2026-EXP7712', label: '🛡️ Security Clearance (Expired)', color: '#94a3b8' }
  ];

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '20px 16px' }}>
      {/* Hidden container for QR file decoder */}
      <div id="qr-file-scan-temp" style={{ display: 'none' }}></div>

      {/* Hero Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} /> Instant Cryptographic Verification System
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.2',
          marginBottom: '12px',
          background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Verify Digital Documents in Real Time
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Authenticate credentials using cryptographic SHA-256 signatures, MongoDB records, and instant QR verification.
        </p>
      </div>

      {/* Verification Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        {/* Verification Mode Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button
            className={`btn ${activeScanMode === 'input' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              stopCamera();
              setActiveScanMode('input');
            }}
          >
            <Search size={16} />
            <span>Document ID Search</span>
          </button>

          <button
            className={`btn ${activeScanMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              stopCamera();
              setActiveScanMode('upload');
            }}
          >
            <Upload size={16} />
            <span>Upload QR Code Image</span>
          </button>

          <button
            className={`btn ${activeScanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveScanMode('camera');
              startCamera();
            }}
          >
            <Camera size={16} />
            <span>Live Camera Scan</span>
          </button>
        </div>

        {/* Mode 1: Document ID Input */}
        {activeScanMode === 'input' && (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                performVerification(docIdInput, 'id_lookup');
              }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
            >
              <div style={{ flex: '1 1 300px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Enter Document ID (e.g. DOC-2026-CS8821)"
                  value={docIdInput}
                  onChange={(e) => setDocIdInput(e.target.value.toUpperCase())}
                  style={{ fontSize: '1rem', paddingLeft: '44px' }}
                />
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '0 28px', minHeight: '46px' }}
              >
                {loading ? <RefreshCw className="spin" size={18} /> : <ShieldCheck size={18} />}
                <span>{loading ? 'Verifying...' : 'Verify Now'}</span>
              </button>
            </form>

            {/* Quick Test Presets */}
            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Quick Test Sample Records (Click to test):
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {quickVerifyPresets.map((preset) => (
                  <button
                    key={preset.id}
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setDocIdInput(preset.id);
                      performVerification(preset.id, 'id_lookup');
                    }}
                    style={{ fontSize: '0.78rem', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Upload QR Code Image */}
        {activeScanMode === 'upload' && (
          <div style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            />
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <QrCode size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '6px' }}>
              Drop QR Code Certificate or Click to Browse
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Supports PNG, JPG, WEBP certificate images and scanned QR codes
            </p>
          </div>
        )}

        {/* Mode 3: Live Camera Scan */}
        {activeScanMode === 'camera' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              maxWidth: '380px',
              margin: '0 auto 16px auto',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(99, 102, 241, 0.4)',
              background: '#000'
            }}>
              <div id="qr-reader-live" style={{ width: '100%' }}></div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
              Point your webcam or phone camera at any document QR code
            </p>
            <button className="btn btn-secondary btn-sm" onClick={stopCamera}>
              Stop Camera
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fda4af',
          padding: '16px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <AlertTriangle size={24} color="#f43f5e" />
          <div>
            <div style={{ fontWeight: '700', color: '#fff' }}>Verification Notice</div>
            <div style={{ fontSize: '0.9rem' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Verification Result Section */}
      {result && (
        <div className="glass-panel-elevated" style={{
          padding: '32px',
          border: result.verified
            ? '2px solid rgba(16, 185, 129, 0.5)'
            : result.isTampered
            ? '2px solid rgba(244, 63, 94, 0.7)'
            : result.status === 'REVOKED'
            ? '2px solid rgba(244, 63, 94, 0.5)'
            : '2px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Header Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: result.verified
                  ? 'rgba(16, 185, 129, 0.2)'
                  : result.isTampered || result.status === 'REVOKED'
                  ? 'rgba(244, 63, 94, 0.2)'
                  : 'rgba(245, 158, 11, 0.2)',
                border: `1px solid ${
                  result.verified
                    ? '#10b981'
                    : result.isTampered || result.status === 'REVOKED'
                    ? '#f43f5e'
                    : '#f59e0b'
                }`
              }}>
                {result.verified ? (
                  <CheckCircle2 size={34} color="#10b981" />
                ) : result.isTampered ? (
                  <ShieldAlert size={34} color="#f43f5e" />
                ) : result.status === 'REVOKED' ? (
                  <XCircle size={34} color="#f43f5e" />
                ) : (
                  <Clock size={34} color="#f59e0b" />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: result.verified
                      ? '#10b981'
                      : result.isTampered || result.status === 'REVOKED'
                      ? '#f43f5e'
                      : '#f59e0b'
                  }}>
                    {result.verified
                      ? 'OFFICIALLY VERIFIED & AUTHENTIC'
                      : result.isTampered
                      ? 'INTEGRITY BREACH: TAMPER DETECTED!'
                      : result.status === 'REVOKED'
                      ? 'DOCUMENT REVOKED BY ISSUER'
                      : result.status === 'EXPIRED'
                      ? 'DOCUMENT HAS EXPIRED'
                      : 'VERIFICATION PENDING'}
                  </span>
                  <span className={`badge badge-${(result.status || 'valid').toLowerCase()}`}>
                    {result.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {result.verified
                    ? 'Cryptographic integrity match verified against MongoDB state registry.'
                    : result.isTampered
                    ? 'The SHA-256 fingerprint generated from current document fields does NOT match the issued seal!'
                    : result.statusReason || 'Please inspect details below.'}
                </p>
              </div>
            </div>

            {/* Print / View Certificate Action */}
            {result.document && (
              <button
                className="btn btn-secondary"
                onClick={() => onViewCertificate && onViewCertificate(result.document)}
              >
                <Printer size={16} />
                <span>View Full Certificate</span>
              </button>
            )}
          </div>

          {/* Document Content Details */}
          {result.document && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Holder & Document Info */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                  Credential Particulars
                </h3>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Document Title
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '4px 0 8px 0' }}>
                    {result.document.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      Category: {result.document.category}
                    </span>
                    <span className="font-mono" style={{
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      ID: {result.document.docId}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Document Holder
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Legal Name</div>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{result.document.holder?.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Identifier / ID No.</div>
                      <div className="font-mono" style={{ fontWeight: '600', color: '#38bdf8' }}>
                        {result.document.holder?.identifier}
                      </div>
                    </div>
                    {result.document.holder?.email && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {result.document.holder?.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Issuer & Authority Info */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                  Issuing Authority & Dates
                </h3>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Authorized Issuer
                  </div>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
                    {result.document.issuer?.name}
                  </div>
                  <div style={{ color: '#818cf8', fontSize: '0.85rem', marginTop: '2px' }}>
                    {result.document.issuer?.organization}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                    Dept: {result.document.issuer?.department || 'Governance'}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Issue Date</div>
                      <div style={{ fontWeight: '600', color: '#fff' }}>
                        {new Date(result.document.issueDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiry Status</div>
                      <div style={{ fontWeight: '600', color: result.document.expiryDate ? '#f8fafc' : '#10b981' }}>
                        {result.document.expiryDate
                          ? new Date(result.document.expiryDate).toLocaleDateString()
                          : 'Permanent / Lifetime'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Verifications</div>
                      <div style={{ fontWeight: '600', color: '#38bdf8' }}>
                        {result.document.verificationCount} times audited
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Stamp</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code & Cryptographic Fingerprint */}
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
                  Cryptographic Integrity & QR Data
                </h3>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  {/* High-res QR Display */}
                  {result.document.qrCode && (
                    <div style={{ textAlign: 'center' }}>
                      <div className="qr-container">
                        <img
                          src={result.document.qrCode}
                          alt="Verifiable QR Code"
                          style={{ width: '130px', height: '130px', display: 'block' }}
                        />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Live Scannable QR
                      </div>
                    </div>
                  )}

                  {/* Hash breakdown */}
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        SHA-256 Digital Fingerprint
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <code className="font-mono" style={{
                          fontSize: '0.8rem',
                          color: '#38bdf8',
                          wordBreak: 'break-all',
                          flex: 1
                        }}>
                          {result.integrityDetails?.recordedHash}
                        </code>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => copyHash(result.integrityDetails?.recordedHash)}
                          title="Copy SHA-256 Hash"
                          style={{ padding: '6px' }}
                        >
                          {copiedHash ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    {result.document.metadata && Object.keys(result.document.metadata).length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Verified Metadata Attributes
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {Object.entries(result.document.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              style={{
                                fontSize: '0.75rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-subtle)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                color: '#e2e8f0'
                              }}
                            >
                              <strong>{key}:</strong> {String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
