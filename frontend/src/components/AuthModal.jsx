import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, X, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const AuthModal = ({ onClose, onLoginSuccess, showToast }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'issuer',
    organization: 'Apex Credential Authority',
    designation: 'Registrar'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register(formData);
        if (res.success) {
          showToast(`Account registered as ${res.user.role}!`, 'success');
          onLoginSuccess(res.user, res.token);
          onClose();
        } else {
          showToast(res.message || 'Registration failed', 'error');
        }
      } else {
        const res = await api.login(formData.email, formData.password);
        if (res.success) {
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          onLoginSuccess(res.user, res.token);
          onClose();
        } else {
          showToast(res.message || 'Invalid credentials', 'error');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        showToast(`Signed in as ${res.user.name} (${res.user.role})`, 'success');
        onLoginSuccess(res.user, res.token);
        onClose();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '440px', padding: '32px', borderRadius: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
              {isRegister ? 'Create Account' : 'Sign In to DocuTrust'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Role-based access for Issuers, Verifiers & Holders
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Quick 1-Click Demo Profiles */}
        {!isRegister && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#a855f7',
              fontWeight: '700',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              <Sparkles size={13} /> 1-Click Demo Logins:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '6px 10px' }}
                onClick={() => handleQuickDemoLogin('issuer@verify.org', 'password123')}
              >
                👑 <strong>Dr. Vance (Issuer / Admin)</strong>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '6px 10px' }}
                onClick={() => handleQuickDemoLogin('verifier@company.com', 'password123')}
              >
                🛡️ <strong>Marcus (Verifier / Auditor)</strong>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '6px 10px' }}
                onClick={() => handleQuickDemoLogin('holder@citizen.org', 'password123')}
              >
                🎓 <strong>Alexander (Document Holder)</strong>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Elena Rostova"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Account Role
                </label>
                <select
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="issuer">Issuer / Admin (Can issue & manage records)</option>
                  <option value="verifier">Verifier / Auditor (Official inspector)</option>
                  <option value="holder">Document Holder (Student / Citizen)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Organization / University
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex National University"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
