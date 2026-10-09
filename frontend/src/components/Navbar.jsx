import React from 'react';
import {
  ShieldCheck,
  Search,
  FileText,
  UserCheck,
  BarChart3,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuth,
  onSwitchDemoUser
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="glass-panel" style={{
      margin: '16px auto',
      maxWidth: '1280px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      position: 'sticky',
      top: '12px',
      zIndex: 100
    }}>
      {/* Brand */}
      <div
        onClick={() => setActiveTab('verify')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
        }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Docu<span style={{ color: '#06b6d4' }}>Trust</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              MERN • SHA-256
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Digital Document Verification & QR Authenticator
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '5px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          className={`btn btn-sm ${activeTab === 'verify' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('verify')}
          title="Instant QR & ID Document Verifier"
        >
          <Search size={15} />
          <span>Verify</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'issuer' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('issuer')}
          title="Manage & Issue Documents (Admin/Issuer)"
        >
          <FileText size={15} />
          <span>Issuer Desk</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'holder' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('holder')}
          title="Holder Credentials Wallet"
        >
          <UserCheck size={15} />
          <span>Holder Vault</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
          title="Audit Trail & Analytics"
        >
          <BarChart3 size={15} />
          <span>Audit & Stats</span>
        </button>

        <button
          className={`btn btn-sm ${activeTab === 'tamper' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tamper')}
          title="Tamper Simulation Lab"
          style={activeTab === 'tamper' ? { background: '#f43f5e', color: '#fff' } : { color: '#fb7185' }}
        >
          <AlertTriangle size={15} />
          <span>Tamper Lab</span>
        </button>
      </nav>

      {/* Account / Demo Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
        {/* Quick Demo Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ fontSize: '0.8rem', padding: '6px 12px', borderColor: 'rgba(99, 102, 241, 0.3)' }}
          >
            <Sparkles size={14} color="#a855f7" />
            <span>Switch Role</span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div
              className="glass-panel-elevated"
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                padding: '10px',
                zIndex: 200,
                boxShadow: '0 16px 36px rgba(0,0,0,0.8)'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 8px', fontWeight: '700', textTransform: 'uppercase' }}>
                Instant Demo Profiles
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', margin: '4px 0', textAlign: 'left' }}
                onClick={() => {
                  onSwitchDemoUser('issuer');
                  setDropdownOpen(false);
                  setActiveTab('issuer');
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', color: '#fff' }}>👑 Dr. Vance (Issuer)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Issue, edit & revoke records</div>
                </div>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', margin: '4px 0', textAlign: 'left' }}
                onClick={() => {
                  onSwitchDemoUser('verifier');
                  setDropdownOpen(false);
                  setActiveTab('verify');
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', color: '#fff' }}>🛡️ Marcus (Verifier)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Official inspector view</div>
                </div>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', margin: '4px 0', textAlign: 'left' }}
                onClick={() => {
                  onSwitchDemoUser('holder');
                  setDropdownOpen(false);
                  setActiveTab('holder');
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', color: '#fff' }}>🎓 Alexander (Holder)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View & display own credentials</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Current User Pill */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: currentUser.role === 'issuer' ? '#6366f1' : currentUser.role === 'verifier' ? '#06b6d4' : '#10b981',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {currentUser.name.charAt(0)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff', lineHeight: 1.1 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
              title="Sign Out"
              style={{ padding: '7px' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
