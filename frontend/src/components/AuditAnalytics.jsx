import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Search,
  RefreshCw,
  Globe,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export const AuditAnalytics = ({ onVerifyDoc }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyticsSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              System Audit Trail & Analytics
            </h1>
            <span className="badge badge-valid">Immutable Log</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Live telemetry of verification requests, QR scans, and cryptographic integrity audits.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Verifications
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>
              {data.summary?.totalVerifications || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged Audit Trail Entries
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Valid Documents
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>
              {data.summary?.validDocs || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
              SHA-256 Validated
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Revoked Credentials
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f43f5e', marginTop: '6px' }}>
              {data.summary?.revokedDocs || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '4px' }}>
              Blacklisted / Annulled
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Issued Records
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#a855f7', marginTop: '6px' }}>
              {data.summary?.totalDocs || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              MongoDB Collections
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Category Distribution & Live Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Category Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Document Distribution by Category
          </h3>

          {data?.categoryStats && data.categoryStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.categoryStats.map((cat) => {
                const total = data.summary?.totalDocs || 1;
                const percentage = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{cat.category}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cat.count} docs ({percentage}%)</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No category metrics recorded yet.</div>
          )}
        </div>

        {/* Real-time Verification Audit Feed */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Real-Time Audit Trail Log
          </h3>

          {data?.recentVerifications && data.recentVerifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recentVerifications.map((log) => (
                <div
                  key={log._id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: log.statusAtVerification === 'VALID'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(244, 63, 94, 0.15)',
                      color: log.statusAtVerification === 'VALID' ? '#10b981' : '#f43f5e'
                    }}>
                      {log.method === 'qr_scan' ? <QrCode size={18} /> : <Search size={18} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="font-mono"
                          onClick={() => onVerifyDoc && onVerifyDoc(log.docId)}
                          style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          {log.docId}
                        </span>
                        <span className={`badge badge-${log.statusAtVerification.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {log.statusAtVerification}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Method: {log.method.replace('_', ' ')} • By {log.verifierName}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No verification events recorded yet. Run a search in the Verifier to log audit entries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
