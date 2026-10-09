import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LiveVerifier } from './components/LiveVerifier';
import { IssuerDashboard } from './components/IssuerDashboard';
import { HolderVault } from './components/HolderVault';
import { AuditAnalytics } from './components/AuditAnalytics';
import { TamperLab } from './components/TamperLab';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('docutrust_token') || null);

  const [toast, setToast] = useState(null);
  const [selectedDocForCert, setSelectedDocForCert] = useState(null);
  const [verifyPresetId, setVerifyPresetId] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check URL query parameters for direct QR scan verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify');
    if (verifyId) {
      setVerifyPresetId(verifyId);
      setActiveTab('verify');
    }
  }, []);

  // Check existing token or load default demo session
  useEffect(() => {
    const initSession = async () => {
      if (token) {
        try {
          const res = await api.getMe(token);
          if (res.success) {
            setCurrentUser(res.user);
            return;
          }
        } catch (err) {
          console.error('Session validation error:', err);
        }
      }

      // Default auto-login to Issuer account so judges/users immediately have full powers!
      try {
        const loginRes = await api.login('issuer@verify.org', 'password123');
        if (loginRes.success) {
          setCurrentUser(loginRes.user);
          setToken(loginRes.token);
          localStorage.setItem('docutrust_token', loginRes.token);
        }
      } catch (err) {
        console.error('Demo auto-login failed:', err);
      }
    };

    initSession();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleLoginSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem('docutrust_token', jwtToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('docutrust_token');
    showToast('Signed out of DocuTrust', 'info');
  };

  const handleSwitchDemoUser = async (role) => {
    let email = 'issuer@verify.org';
    if (role === 'verifier') email = 'verifier@company.com';
    if (role === 'holder') email = 'holder@citizen.org';

    try {
      const res = await api.login(email, 'password123');
      if (res.success) {
        handleLoginSuccess(res.user, res.token);
        showToast(`Switched active profile to ${res.user.name} (${res.user.role})`, 'success');
      }
    } catch (err) {
      showToast('Error switching demo role: ' + err.message, 'error');
    }
  };

  const handleVerifyDoc = (docId) => {
    setVerifyPresetId(docId);
    setActiveTab('verify');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient Glassmorphism Floating Lights Background */}
      <div className="ambient-background-layer" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
        <div className="ambient-orb ambient-orb-4" />
      </div>

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchDemoUser={handleSwitchDemoUser}
      />

      {/* Main Tab Views */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'verify' && (
          <LiveVerifier
            defaultDocId={verifyPresetId}
            onViewCertificate={(doc) => setSelectedDocForCert(doc)}
          />
        )}

        {activeTab === 'issuer' && (
          <IssuerDashboard
            token={token}
            currentUser={currentUser}
            onVerifyDoc={handleVerifyDoc}
            onViewCertificate={(doc) => setSelectedDocForCert(doc)}
            showToast={showToast}
          />
        )}

        {activeTab === 'holder' && (
          <HolderVault
            currentUser={currentUser}
            token={token}
            onVerifyDoc={handleVerifyDoc}
            onViewCertificate={(doc) => setSelectedDocForCert(doc)}
            showToast={showToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AuditAnalytics
            onVerifyDoc={handleVerifyDoc}
          />
        )}

        {activeTab === 'tamper' && (
          <TamperLab
            onVerifyDoc={handleVerifyDoc}
            showToast={showToast}
          />
        )}
      </main>

      {/* Official Certificate Modal */}
      {selectedDocForCert && (
        <CertificateModal
          document={selectedDocForCert}
          onClose={() => setSelectedDocForCert(null)}
        />
      )}

      {/* Sign In / Register Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      )}

      {/* Notification Toast */}
      {toast && (
        <div className="toast">
          {toast.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#f43f5e" />}
          {toast.type === 'info' && <Info size={18} color="#38bdf8" />}
          <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(9, 13, 22, 0.95)',
        padding: '24px 20px',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#6366f1" />
            <span style={{ fontWeight: '700', color: '#fff' }}>DocuTrust Verification Platform</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>MongoDB Database</span>
            <span>•</span>
            <span>Express.js REST APIs</span>
            <span>•</span>
            <span>React.js Interface</span>
            <span>•</span>
            <span>Node.js Backend</span>
            <span>•</span>
            <span>SHA-256 Crypto</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            MERN Stack Digital Document Verification System
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
