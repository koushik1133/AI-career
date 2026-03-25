import { useState } from 'react';
import { useData } from '../context/DataContext';
import { generatePrepPlan } from '../utils/aiEngine';
import {
  Search, Plus, ExternalLink, Pencil, Trash2,
  BookOpen, Briefcase, X, ChevronDown
} from 'lucide-react';

const STATUSES = [
  'Not Applied', 'Applied', 'Online Assessment',
  'Recruiter Interview', 'Technical Interview',
  'Final Round', 'Offer', 'Rejected'
];

const STATUS_CLASS = {
  'Not Applied': 'not-applied',
  'Applied': 'applied',
  'Online Assessment': 'oa',
  'Recruiter Interview': 'interview',
  'Technical Interview': 'interview',
  'Final Round': 'interview',
  'Offer': 'offer',
  'Rejected': 'rejected',
};

export default function JobsPage() {
  const { jobs, addJob, updateJob, deleteJob } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [prepJob, setPrepJob] = useState(null);

  // Form state
  const [form, setForm] = useState({
    company: '', jobTitle: '', jobId: '', jobLink: '',
    resumeUsed: '', atsScore: '', matchScore: '',
    status: 'Not Applied', dateApplied: new Date().toISOString().split('T')[0]
  });

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search ||
      job.company?.toLowerCase().includes(search.toLowerCase()) ||
      job.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAddModal = () => {
    setForm({
      company: '', jobTitle: '', jobId: '', jobLink: '',
      resumeUsed: '', atsScore: '', matchScore: '',
      status: 'Not Applied', dateApplied: new Date().toISOString().split('T')[0]
    });
    setEditingJob(null);
    setShowAddModal(true);
  };

  const openEditModal = (job) => {
    setForm({
      company: job.company || '',
      jobTitle: job.jobTitle || '',
      jobId: job.jobId || '',
      jobLink: job.jobLink || '',
      resumeUsed: job.resumeUsed || '',
      atsScore: job.atsScore || '',
      matchScore: job.matchScore || '',
      status: job.status || 'Not Applied',
      dateApplied: job.dateApplied ? job.dateApplied.split('T')[0] : ''
    });
    setEditingJob(job);
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      atsScore: parseInt(form.atsScore) || 0,
      matchScore: parseInt(form.matchScore) || 0,
    };

    if (editingJob) {
      updateJob(editingJob.id, data);
    } else {
      addJob(data);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this job entry?')) {
      deleteJob(id);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const prepPlan = prepJob ? generatePrepPlan(prepJob) : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Job Tracker</h1>
            <p className="page-description">
              Track all your job applications in one place. Manage status, and prepare for interviews.
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Add Job
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {filteredJobs.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Title</th>
                <th>ATS</th>
                <th>Match</th>
                <th>Status</th>
                <th>Date</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-md)',
                        background: 'rgba(var(--accent-primary-rgb), 0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent-primary)', fontWeight: 700, fontSize: 'var(--font-size-sm)',
                        flexShrink: 0
                      }}>
                        {(job.company || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{job.company}</div>
                        {job.jobLink && (
                          <a href={job.jobLink} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            View listing <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{job.jobTitle}</div>
                    {job.jobId && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ID: {job.jobId}</div>}
                  </td>
                  <td>
                    <span className={`score-cell ${getScoreClass(job.atsScore || 0)}`}>
                      {job.atsScore || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`score-cell ${getScoreClass(job.matchScore || 0)}`}>
                      {job.matchScore ? `${job.matchScore}%` : '—'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={job.status}
                      onChange={(e) => updateJob(job.id, { status: e.target.value })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                    {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {job.resumeUsed || '—'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button title="Prepare" onClick={() => setPrepJob(job)}>
                        <BookOpen size={16} />
                      </button>
                      <button title="Edit" onClick={() => openEditModal(job)}>
                        <Pencil size={16} />
                      </button>
                      <button className="delete" title="Delete" onClick={() => handleDelete(job.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Briefcase size={64} />
            </div>
            <h3 className="empty-state-title">No jobs yet</h3>
            <p className="empty-state-text">
              {search || filterStatus !== 'All'
                ? 'No matching jobs found. Try adjusting your filters.'
                : 'Start tracking your job applications. Add a job manually or analyze a resume to auto-create entries.'}
            </p>
            {!search && filterStatus === 'All' && (
              <button className="btn btn-primary" onClick={openAddModal}>
                <Plus size={18} />
                Add Your First Job
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingJob ? 'Edit Job' : 'Add New Job'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input className="form-input" required value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input className="form-input" required value={form.jobTitle}
                      onChange={e => setForm({ ...form, jobTitle: e.target.value })} style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Job ID</label>
                    <input className="form-input" value={form.jobId}
                      onChange={e => setForm({ ...form, jobId: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Link</label>
                    <input className="form-input" type="url" value={form.jobLink}
                      onChange={e => setForm({ ...form, jobLink: e.target.value })} style={{ width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">ATS Score</label>
                    <input className="form-input" type="number" min="0" max="100" value={form.atsScore}
                      onChange={e => setForm({ ...form, atsScore: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Match Score</label>
                    <input className="form-input" type="number" min="0" max="100" value={form.matchScore}
                      onChange={e => setForm({ ...form, matchScore: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Resume Used</label>
                    <input className="form-input" value={form.resumeUsed}
                      onChange={e => setForm({ ...form, resumeUsed: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Applied</label>
                    <input className="form-input" type="date" value={form.dateApplied}
                      onChange={e => setForm({ ...form, dateApplied: e.target.value })} style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingJob ? 'Save Changes' : 'Add Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prep Modal */}
      {prepJob && prepPlan && (
        <div className="modal-overlay" onClick={() => setPrepJob(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  <BookOpen size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} />
                  {prepPlan.title}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {prepJob.company} — {prepJob.jobTitle} ({prepJob.status})
                </p>
              </div>
              <button className="modal-close" onClick={() => setPrepJob(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body prepare-content">
              <div className="prepare-section">
                <h4>📋 Study Plan</h4>
                <ul>
                  {prepPlan.plan.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="prepare-section">
                <h4>❓ Likely Questions</h4>
                <ul>
                  {prepPlan.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
