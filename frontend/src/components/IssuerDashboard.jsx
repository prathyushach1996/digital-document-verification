import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  Printer,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export const IssuerDashboard = ({
  token,
  currentUser,
  onVerifyDoc,
  onViewCertificate,
  showToast
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    description: '',
    holderName: '',
    holderId: '',
    holderEmail: '',
    holderPhone: '',
    holderOrg: '',
    expiryDate: '',
    customDocId: '',
    metadata: [{ key: 'Honors', value: 'First Class' }]
  });

  const [statusForm, setStatusForm] = useState({
    status: 'REVOKED',
    reason: ''
  });

  const [copiedId, setCopiedId] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({
        search,
        status: statusFilter,
        category: categoryFilter
      }, token);
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      showToast('Error loading documents from MongoDB: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [search, statusFilter, categoryFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      title: '',
      category: 'Academic',
      description: '',
      holderName: '',
      holderId: '',
      holderEmail: '',
      holderPhone: '',
      holderOrg: '',
      expiryDate: '',
      customDocId: '',
      metadata: [{ key: 'Honors', value: 'High Distinction' }]
    });
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (doc) => {
    setSelectedDoc(doc);
    const metaArray = doc.metadata
      ? Object.entries(doc.metadata).map(([key, value]) => ({ key, value }))
      : [];
    setFormData({
      title: doc.title || '',
      category: doc.category || 'Academic',
      description: doc.description || '',
      holderName: doc.holder?.name || '',
      holderId: doc.holder?.identifier || '',
      holderEmail: doc.holder?.email || '',
      holderPhone: doc.holder?.phone || '',
      holderOrg: doc.holder?.organization || '',
      expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
      customDocId: doc.docId || '',
      metadata: metaArray.length > 0 ? metaArray : [{ key: '', value: '' }]
    });
    setIsEditOpen(true);
  };

  // Open Status Changer Modal
  const openStatusModal = (doc) => {
    setSelectedDoc(doc);
    setStatusForm({
      status: doc.status === 'VALID' ? 'REVOKED' : 'VALID',
      reason: doc.statusReason || ''
    });
    setIsStatusOpen(true);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.holderName || !formData.holderId) {
      showToast('Please fill all required fields (Title, Holder Name, Holder ID)', 'error');
      return;
    }

    // Convert metadata array to object
    const metaObj = {};
    formData.metadata.forEach((item) => {
      if (item.key.trim()) metaObj[item.key.trim()] = item.value.trim();
    });

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        customDocId: formData.customDocId,
        holder: {
          name: formData.holderName,
          identifier: formData.holderId,
          email: formData.holderEmail,
          phone: formData.holderPhone,
          organization: formData.holderOrg
        },
        expiryDate: formData.expiryDate || null,
        metadata: metaObj
      };

      const res = await api.createDocument(payload, token);
      if (res.success) {
        showToast(`Document "${res.document.docId}" issued with SHA-256 seal & QR!`, 'success');
        setIsCreateOpen(false);
        fetchDocuments();
      } else {
        showToast(res.message || 'Error issuing document', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    const metaObj = {};
    formData.metadata.forEach((item) => {
      if (item.key.trim()) metaObj[item.key.trim()] = item.value.trim();
    });

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        holder: {
          name: formData.holderName,
          identifier: formData.holderId,
          email: formData.holderEmail,
          phone: formData.holderPhone,
          organization: formData.holderOrg
        },
        expiryDate: formData.expiryDate || null,
        metadata: metaObj
      };

      const res = await api.updateDocument(selectedDoc._id, payload, token);
      if (res.success) {
        showToast('Document record updated & re-signed with new cryptographic hash', 'success');
        setIsEditOpen(false);
        fetchDocuments();
      } else {
        showToast(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Status Update Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      const res = await api.updateStatus(selectedDoc._id, statusForm.status, statusForm.reason, token);
      if (res.success) {
        showToast(`Status updated to ${statusForm.status}`, 'success');
        setIsStatusOpen(false);
        fetchDocuments();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Delete
  const handleDelete = async (id, docId) => {
    if (!window.confirm(`Are you sure you want to permanently delete document "${docId}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.deleteDocument(id, token);
      if (res.success) {
        showToast(`Document "${docId}" deleted successfully`, 'success');
        fetchDocuments();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyDocId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied ${id} to clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics
  const validCount = documents.filter((d) => d.status === 'VALID').length;
  const revokedCount = documents.filter((d) => d.status === 'REVOKED').length;
  const expiredCount = documents.filter((d) => d.status === 'EXPIRED').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
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
              Issuer Management Portal
            </h1>
            <span className="badge badge-valid">MERN CRUD LIVE</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Add, search, edit, secure, and manage verifiable digital records stored in MongoDB.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Issue New Document</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Issued Documents
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
            {documents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '4px' }}>
            MongoDB Collection: documents
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Valid & Verified
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>
            {validCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>
            Active Cryptographic Seals
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Revoked Documents
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f43f5e', marginTop: '6px' }}>
            {revokedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '4px' }}>
            Flagged & Inactive
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Expired Credentials
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#94a3b8', marginTop: '6px' }}>
            {expiredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Past Validity Window
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID, Title, Holder Name, Identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'VALID', 'REVOKED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
              style={{ fontSize: '0.78rem' }}
            >
              {st}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Identity">Identity</option>
            <option value="Medical">Medical</option>
            <option value="Legal">Legal</option>
            <option value="Employment">Employment</option>
            <option value="Government">Government</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchDocuments} title="Refresh records">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Documents Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '14px 20px' }}>Doc ID & QR</th>
                <th style={{ padding: '14px 20px' }}>Title & Category</th>
                <th style={{ padding: '14px 20px' }}>Holder Details</th>
                <th style={{ padding: '14px 20px' }}>Issue Date</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading documents from MongoDB...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No document records found matching filters.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc._id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Doc ID & QR Mini Thumbnail */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {doc.qrCode && (
                          <img
                            src={doc.qrCode}
                            alt="QR"
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '6px',
                              background: '#fff',
                              padding: '2px'
                            }}
                          />
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="font-mono" style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.85rem' }}>
                              {doc.docId}
                            </span>
                            <button
                              onClick={() => copyDocId(doc.docId)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Copy Doc ID"
                            >
                              {copiedId === doc.docId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            SHA-256: {doc.digitalHash?.substring(0, 10)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Title & Category */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.92rem' }}>
                        {doc.title}
                      </div>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '0.72rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {doc.category}
                      </span>
                    </td>

                    {/* Holder Details */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '0.9rem' }}>
                        {doc.holder?.name}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ID: {doc.holder?.identifier}
                      </div>
                      {doc.holder?.email && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {doc.holder.email}
                        </div>
                      )}
                    </td>

                    {/* Issue Date */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                        {new Date(doc.issueDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Audited {doc.verificationCount || 0} times
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge badge-${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                      {doc.status === 'REVOKED' && doc.statusReason && (
                        <div style={{ fontSize: '0.7rem', color: '#fda4af', marginTop: '4px', maxWidth: '200px' }}>
                          {doc.statusReason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Verify / Inspect */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onVerifyDoc && onVerifyDoc(doc.docId)}
                          title="Instant Verify in Portal"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Certificate View */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onViewCertificate && onViewCertificate(doc)}
                          title="View Official Certificate & QR"
                        >
                          <Printer size={14} />
                        </button>

                        {/* Status Toggle Modal */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openStatusModal(doc)}
                          title="Change Status (Valid / Revoke)"
                          style={doc.status === 'REVOKED' ? { borderColor: 'rgba(244,63,94,0.4)' } : {}}
                        >
                          <AlertOctagon size={14} color={doc.status === 'REVOKED' ? '#f43f5e' : '#f59e0b'} />
                        </button>

                        {/* Edit Document */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(doc)}
                          title="Edit Document Particulars"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete Document */}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(doc._id, doc.docId)}
                          title="Delete Permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DOCUMENT MODAL */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div
            className="glass-panel-elevated"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                  Issue Cryptographic Digital Document
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Generates an immutable SHA-256 fingerprint and verifiable QR code automatically.
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Document Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Master of Science in Data Engineering"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Category & Custom ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Identity">Identity</option>
                    <option value="Medical">Medical</option>
                    <option value="Legal">Legal</option>
                    <option value="Employment">Employment</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Custom Doc ID (Optional, auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. DOC-2026-CS9000"
                    value={formData.customDocId}
                    onChange={(e) => setFormData({ ...formData, customDocId: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* Holder Info Section */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', marginBottom: '12px' }}>
                  Holder Particulars
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Holder Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Alexander Wright"
                      value={formData.holderName}
                      onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Holder Identifier / ID No. *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input font-mono"
                      placeholder="e.g. STU-992014 or PASSPORT-8812"
                      value={formData.holderId}
                      onChange={(e) => setFormData({ ...formData, holderId: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Holder Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="holder@citizen.org"
                      value={formData.holderEmail}
                      onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Organization / Institute
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Apex National University"
                      value={formData.holderOrg}
                      onChange={(e) => setFormData({ ...formData, holderOrg: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description & Expiry Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Description / Summary
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Conferred with distinction for academic excellence"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Dynamic Metadata Attributes */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Custom Metadata Attributes (Key-Value)
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setFormData({
                      ...formData,
                      metadata: [...formData.metadata, { key: '', value: '' }]
                    })}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    + Add Field
                  </button>
                </div>

                {formData.metadata.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Key (e.g. GPA, License No)"
                      value={item.key}
                      onChange={(e) => {
                        const newMeta = [...formData.metadata];
                        newMeta[idx].key = e.target.value;
                        setFormData({ ...formData, metadata: newMeta });
                      }}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Value (e.g. 3.98, MD-8812)"
                      value={item.value}
                      onChange={(e) => {
                        const newMeta = [...formData.metadata];
                        newMeta[idx].value = e.target.value;
                        setFormData({ ...formData, metadata: newMeta });
                      }}
                      style={{ flex: 1.5 }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const newMeta = formData.metadata.filter((_, i) => i !== idx);
                        setFormData({ ...formData, metadata: newMeta });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <ShieldCheck size={18} />
                  <span>Issue & Sign Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCUMENT MODAL */}
      {isEditOpen && selectedDoc && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div
            className="glass-panel-elevated"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>
                  Edit Document ({selectedDoc.docId})
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Updating fields will automatically recompute the SHA-256 fingerprint & QR code.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Identity">Identity</option>
                    <option value="Medical">Medical</option>
                    <option value="Legal">Legal</option>
                    <option value="Employment">Employment</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', marginBottom: '12px' }}>
                  Holder Particulars
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Holder Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.holderName}
                      onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Holder Identifier / ID
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input font-mono"
                      value={formData.holderId}
                      onChange={(e) => setFormData({ ...formData, holderId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Description
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={18} />
                  <span>Update & Re-Sign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS CHANGE / REVOCATION MODAL */}
      {isStatusOpen && selectedDoc && (
        <div className="modal-overlay" onClick={() => setIsStatusOpen(false)}>
          <div
            className="glass-panel-elevated"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '500px', padding: '28px' }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              Change Document Status
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Target Document: <strong className="font-mono" style={{ color: '#38bdf8' }}>{selectedDoc.docId}</strong> ({selectedDoc.title})
            </p>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Verification Status
                </label>
                <select
                  className="form-input"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  <option value="VALID">VALID (Active & Authenticated)</option>
                  <option value="REVOKED">REVOKED (Flag as Invalid / Cancelled)</option>
                  <option value="EXPIRED">EXPIRED (Past Validity Window)</option>
                  <option value="PENDING">PENDING (Under Review)</option>
                </select>
              </div>

              {statusForm.status === 'REVOKED' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#f43f5e', marginBottom: '6px' }}>
                    Revocation Reason *
                  </label>
                  <textarea
                    required
                    className="form-input"
                    rows={3}
                    placeholder="Provide official rationale (e.g. Disciplinary revocation, fraudulent submission, tribunal ruling)"
                    value={statusForm.reason}
                    onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsStatusOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={statusForm.status === 'REVOKED' ? 'btn btn-danger' : 'btn btn-primary'}
                >
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
