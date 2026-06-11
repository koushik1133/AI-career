import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import {
  Search, Users, Plus, Trash2, Mail, ExternalLink,
  Upload, FileText, CheckCircle, HelpCircle, Copy, AlertCircle, Sparkles, X
} from 'lucide-react';
import {
  searchPeopleAtCompany,
  parseLinkedInText,
  parseLinkedInPDF,
  calculateRelevanceScore
} from '../utils/networkingEngine';
import {
  generateConnectionNote,
  generateFollowUpNote
} from '../utils/aiEngine';

export default function NetworkingPage() {
  const { contacts, addContact, deleteContact, updateContact, userProfile } = useData();
  const fileInputRef = useRef(null);

  // Search State
  const [searchCompany, setSearchCompany] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [googleSearchUrl, setGoogleSearchUrl] = useState('');
  const [searching, setSearching] = useState(false);

  // Import States
  const [importTab, setImportTab] = useState('text'); // 'text' | 'pdf' | 'manual'
  const [pastedText, setPastedText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    title: '',
    company: '',
    linkedinUrl: '',
    about: '',
    skills: '',
    experience: '',
    education: ''
  });

  // Modal Note Generator States
  const [selectedContact, setSelectedContact] = useState(null);
  const [noteTone, setNoteTone] = useState('professional'); // 'professional' | 'casual' | 'referral_ask' | 'follow_up'
  const [generatedNote, setGeneratedNote] = useState('');
  const [copied, setCopied] = useState(false);

  // Handlers
  const handleSearch = () => {
    if (!searchCompany.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setTimeout(() => {
      const { results, googleSearchUrl } = searchPeopleAtCompany(searchCompany, searchRole);
      setSearchResults(results);
      setGoogleSearchUrl(googleSearchUrl);
      setSearching(false);
    }, 1000);
  };

  const handleParseText = () => {
    if (!pastedText.trim()) return;
    const parsed = parseLinkedInText(pastedText);
    if (parsed) {
      setParsedPreview(parsed);
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFileName(file.name);
    setParsing(true);
    setParsedPreview(null);
    try {
      const parsed = await parseLinkedInPDF(file);
      setParsedPreview(parsed);
    } catch (err) {
      console.error(err);
      alert('Error parsing PDF file.');
    } finally {
      setParsing(false);
    }
  };

  const handleAddParsedToNetwork = () => {
    if (!parsedPreview) return;
    addContact(parsedPreview);
    setParsedPreview(null);
    setPastedText('');
    setPdfFileName('');
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    const contactData = {
      name: manualForm.name,
      title: manualForm.title,
      company: manualForm.company,
      linkedinUrl: manualForm.linkedinUrl,
      about: manualForm.about,
      skills: manualForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      experience: manualForm.experience.split(',').map(e => e.trim()).filter(Boolean),
      education: manualForm.education,
      source: 'manual',
      relevanceScore: 75
    };
    addContact(contactData);
    setManualForm({
      name: '',
      title: '',
      company: '',
      linkedinUrl: '',
      about: '',
      skills: '',
      experience: '',
      education: ''
    });
    alert('Contact added to network!');
  };

  const handleOpenNoteModal = (contact) => {
    setSelectedContact(contact);
    setNoteTone('professional');
    const note = generateConnectionNote(userProfile || {}, contact, null, 'professional');
    setGeneratedNote(note);
    setCopied(false);
  };

  const handleToneChange = (tone) => {
    setNoteTone(tone);
    setCopied(false);
    if (!selectedContact) return;
    
    let note = '';
    if (tone === 'follow_up') {
      note = generateFollowUpNote(userProfile || {}, selectedContact);
    } else {
      note = generateConnectionNote(userProfile || {}, selectedContact, null, tone);
    }
    setGeneratedNote(note);
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = () => {
    if (!selectedContact) return;
    updateContact(selectedContact.id, { connectionNote: generatedNote });
    setSelectedContact(null);
    alert('Connection note updated!');
  };

  return (
    <div className="networking-page">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Networking Hub</h1>
            <p className="page-description">
              Discover professionals at target companies and generate hyper-personalized outreach notes.
            </p>
          </div>
        </div>
      </div>

      <div className="networking-grid">
        
        {/* Left Side: Search & Import */}
        <div className="networking-left-panel">
          
          {/* Section 1: Search Discovery */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} style={{ color: 'var(--accent-primary)' }} />
                Discover People
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stripe"
                  value={searchCompany}
                  onChange={e => setSearchCompany(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Role / Department (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Engineering Lead"
                  value={searchRole}
                  onChange={e => setSearchRole(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSearch} disabled={!searchCompany.trim() || searching} style={{ width: '100%' }}>
              {searching ? (
                <>
                  <span className="spinner" />
                  Searching Profiles...
                </>
              ) : (
                'Find People at Company'
              )}
            </button>

            {googleSearchUrl && (
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              >
                <ExternalLink size={14} />
                Open LinkedIn Search on Google ↗
              </a>
            )}

            {/* Discovery Results */}
            {searchResults.length > 0 && (
              <div className="discovery-results" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px' }}>Discovery Search Results</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {searchResults.map(result => (
                    <div key={result.id} className="discovery-card">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{result.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{result.title}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Match relevance: {result.relevanceScore}%</div>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          addContact(result);
                          setSearchResults(prev => prev.filter(r => r.id !== result.id));
                        }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Import Profile */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                Import LinkedIn Profile
              </h3>
            </div>

            {/* Import Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--spacing-md)' }}>
              <button className={`tab ${importTab === 'text' ? 'active' : ''}`} onClick={() => { setImportTab('text'); setParsedPreview(null); }}>
                Paste Text
              </button>
              <button className={`tab ${importTab === 'pdf' ? 'active' : ''}`} onClick={() => { setImportTab('pdf'); setParsedPreview(null); }}>
                Upload PDF
              </button>
              <button className={`tab ${importTab === 'manual' ? 'active' : ''}`} onClick={() => { setImportTab('manual'); setParsedPreview(null); }}>
                Manual Add
              </button>
            </div>

            {importTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Copy everything on a person's LinkedIn profile (Cmd+A / Ctrl+A) and paste it below. We'll parse the details automatically.
                </p>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Paste LinkedIn page content here..."
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  style={{ width: '100%' }}
                />
                <button className="btn btn-primary" onClick={handleParseText} disabled={!pastedText.trim()}>
                  Parse Profile Text
                </button>
              </div>
            )}

            {importTab === 'pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Go to a person's LinkedIn Profile → click <strong>More</strong> → select <strong>Save to PDF</strong>. Upload that PDF file below.
                </p>
                <div
                  className={`upload-zone ${pdfFileName ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: 'var(--spacing-lg)' }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">
                    {pdfFileName ? <CheckCircle size={32} /> : <Upload size={32} />}
                  </div>
                  <div className="upload-text" style={{ fontSize: 'var(--font-size-sm)' }}>
                    {pdfFileName ? pdfFileName : 'Select LinkedIn PDF Export'}
                  </div>
                </div>
                {parsing && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="spinner" />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Reading PDF structures...</span>
                  </div>
                )}
              </div>
            )}

            {importTab === 'manual' && (
              <form onSubmit={handleAddManual} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={manualForm.name}
                      onChange={e => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. SWE"
                      value={manualForm.title}
                      onChange={e => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Stripe"
                      value={manualForm.company}
                      onChange={e => setManualForm(prev => ({ ...prev, company: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={manualForm.linkedinUrl}
                      onChange={e => setManualForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">About / Bio</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={manualForm.about}
                    onChange={e => setManualForm(prev => ({ ...prev, about: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="React, AWS, Node"
                    value={manualForm.skills}
                    onChange={e => setManualForm(prev => ({ ...prev, skills: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
                  Add Contact Manually
                </button>
              </form>
            )}

            {/* Parsed Preview Card */}
            {parsedPreview && (
              <div className="parsed-preview-card animate-slide-up" style={{ marginTop: 'var(--spacing-md)', padding: '12px', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', background: 'rgba(52, 211, 153, 0.05)' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', color: 'var(--success)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  <CheckCircle size={16} />
                  Successfully Parsed!
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{parsedPreview.name}</strong>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    {parsedPreview.title} at {parsedPreview.company}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Skills: {parsedPreview.skills.slice(0, 5).join(', ')}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAddParsedToNetwork} style={{ width: '100%' }}>
                  Confirm & Add to My Network
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: My Network List */}
        <div className="networking-right-panel">
          <div className="card" style={{ minHeight: '500px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--accent-primary)' }} />
                My Network ({contacts.length})
              </h3>
            </div>

            {contacts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>No contacts added yet</p>
                <p style={{ fontSize: 'var(--font-size-xs)', maxWidth: '300px' }}>
                  Use the left discovery search or upload LinkedIn profiles to start building your network outreach lists.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                {contacts.map(contact => (
                  <div key={contact.id} className="contact-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {contact.name}
                          {contact.linkedinUrl && (
                            <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="text-muted hover-primary">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                          {contact.title} at <strong>{contact.company}</strong>
                        </div>
                      </div>
                      <div className="relevance-badge">
                        Match: {contact.relevanceScore || 75}%
                      </div>
                    </div>

                    {contact.about && (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', margin: '8px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {contact.about}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '8px 0' }}>
                      {(contact.skills || []).slice(0, 4).map((skill, idx) => (
                        <span key={idx} style={{ fontSize: '10px', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px' }}
                        onClick={() => handleOpenNoteModal(contact)}
                      >
                        <Mail size={14} />
                        Outreach Notes
                      </button>
                      <button
                        className="btn btn-secondary btn-sm text-rejected"
                        onClick={() => deleteContact(contact.id)}
                        style={{ padding: '6px 10px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Outreach Notes Generator Modal */}
      {selectedContact && (
        <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                AI Outreach Note for {selectedContact.name}
              </h3>
              <button className="modal-close" onClick={() => setSelectedContact(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <button
                  className={`tab ${noteTone === 'professional' ? 'active' : ''}`}
                  onClick={() => handleToneChange('professional')}
                  style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                >
                  Professional
                </button>
                <button
                  className={`tab ${noteTone === 'casual' ? 'active' : ''}`}
                  onClick={() => handleToneChange('casual')}
                  style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                >
                  Casual
                </button>
                <button
                  className={`tab ${noteTone === 'referral_ask' ? 'active' : ''}`}
                  onClick={() => handleToneChange('referral_ask')}
                  style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                >
                  Referral Ask
                </button>
                <button
                  className={`tab ${noteTone === 'follow_up' ? 'active' : ''}`}
                  onClick={() => handleToneChange('follow_up')}
                  style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                >
                  Follow-up
                </button>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <textarea
                  className="form-input"
                  rows={8}
                  value={generatedNote}
                  onChange={e => setGeneratedNote(e.target.value)}
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', lineHeight: 1.5, paddingRight: '40px' }}
                />
                <button
                  onClick={handleCopyNote}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Copy note"
                >
                  {copied ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} style={{ color: 'var(--text-secondary)' }} />}
                </button>
              </div>

              {copied && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: 'var(--success)', fontSize: 'var(--font-size-xs)', marginTop: '6px' }}>
                  <CheckCircle size={12} />
                  Copied note text to clipboard!
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedContact(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveNote}>
                Save Outreach Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
