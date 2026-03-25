import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import {
  Upload, FileText, Sparkles, Download, CheckCircle, XCircle,
  AlertTriangle, Target, TrendingUp, ArrowRight, BarChart2,
  Eye, ChevronDown, ChevronUp, Zap, Award
} from 'lucide-react';
import { analyzeResume, generateOptimizedResume } from '../utils/aiEngine';
import ScoreRing from '../components/ScoreRing';

export default function ResumePage() {
  const { addJob, addResume } = useData();
  const fileInputRef = useRef(null);

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [fileName, setFileName] = useState('');

  const [analysis, setAnalysis] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedSections, setExpandedSections] = useState({});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === 'text/plain' || file.name.endsWith('.tex') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // For PDF - read as text (basic extraction)
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Basic PDF text extraction by reading binary
          const text = extractTextFromPDF(event.target.result);
          setResumeText(text || 'PDF uploaded: ' + file.name + '\n\n[Paste your resume text below for best results]');
        } catch {
          setResumeText('PDF uploaded: ' + file.name + '\n\n[Paste your resume text below for best results]');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  function extractTextFromPDF(buffer) {
    // Basic PDF text extraction - looks for text between BT and ET markers
    const uint8 = new Uint8Array(buffer);
    let text = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(uint8);

    // Extract readable strings
    const matches = raw.match(/\(([^)]+)\)/g);
    if (matches) {
      text = matches
        .map(m => m.slice(1, -1))
        .filter(s => s.length > 1 && /[a-zA-Z]/.test(s))
        .join(' ');
    }

    // Also try to find text streams
    const streamMatches = raw.match(/stream\r?\n([\s\S]*?)\r?\nendstream/g);
    if (streamMatches) {
      for (const sm of streamMatches) {
        const inner = sm.replace(/^stream\r?\n/, '').replace(/\r?\nendstream$/, '');
        const readable = inner.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (readable.length > 20 && /[a-zA-Z]{3,}/.test(readable)) {
          text += '\n' + readable;
        }
      }
    }

    return text.trim();
  }

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;

    setAnalyzing(true);
    setAnalysis(null);
    setOptimized(null);
    setActiveTab('analysis');

    setTimeout(() => {
      const result = analyzeResume(resumeText, jobDescription, companyName, jobTitle);
      setAnalysis(result);
      setAnalyzing(false);
    }, 1500);
  };

  const handleOptimize = () => {
    if (!analysis) return;

    setOptimizing(true);
    setTimeout(() => {
      const result = generateOptimizedResume(resumeText, jobDescription, analysis);
      setOptimized(result);
      setActiveTab('optimized');
      setOptimizing(false);

      // Save resume version
      addResume({
        company: companyName || 'General',
        jobTitle: jobTitle || 'N/A',
        atsScore: result.newAtsScore,
        originalAtsScore: analysis.atsScore,
        fileName: fileName || 'resume.txt'
      });
    }, 2000);
  };

  const handleDownload = () => {
    const text = optimized?.optimizedText || resumeText;
    const nameSlug = companyName ? companyName.replace(/\s+/g, '_').toLowerCase() : 'company';
    const roleSlug = jobTitle ? jobTitle.replace(/\s+/g, '_').toLowerCase() : 'role';
    const downloadName = `resume_${nameSlug}_${roleSlug}.txt`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToJobs = () => {
    addJob({
      company: companyName || 'Unknown Company',
      jobTitle: jobTitle || 'Unknown Role',
      jobId: '',
      jobLink: '',
      resumeUsed: fileName || 'resume.txt',
      atsScore: optimized?.newAtsScore || analysis?.atsScore || 0,
      matchScore: analysis?.matchScore || 0,
      shouldApply: analysis?.shouldApply || 'unknown',
      dateApplied: new Date().toISOString(),
      status: 'Not Applied'
    });
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--score-excellent)';
    if (score >= 60) return 'var(--score-good)';
    if (score >= 40) return 'var(--score-average)';
    return 'var(--score-poor)';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Resume Optimization</h1>
            <p className="page-description">
              Upload your resume and paste a job description to get AI-powered analysis and optimization.
            </p>
          </div>
        </div>
      </div>

      <div className="resume-layout">
        {/* Left Panel - Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Upload Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                Resume
              </h3>
            </div>

            <div
              className={`upload-zone ${fileName ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('active')}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('active');
                const file = e.dataTransfer.files[0];
                if (file) {
                  const input = fileInputRef.current;
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  input.files = dt.files;
                  handleFileUpload({ target: { files: [file] } });
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.tex,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">
                {fileName ? <CheckCircle size={48} /> : <Upload size={48} />}
              </div>
              <div className="upload-text">
                {fileName ? fileName : 'Drop your resume here or click to browse'}
              </div>
              <div className="upload-hint">
                {fileName ? 'Click to replace' : 'Supports PDF, LaTeX (.tex), and text files'}
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <label className="form-label">Or paste your resume text</label>
              <textarea
                className="form-input"
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={6}
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} style={{ color: 'var(--accent-primary)' }} />
                Job Description
              </h3>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Google"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <textarea
              className="form-input"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={8}
              style={{ width: '100%' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || !jobDescription.trim() || analyzing}
            >
              {analyzing ? (
                <>
                  <span className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {!analysis && !analyzing && (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Sparkles size={64} />
                </div>
                <h3 className="empty-state-title">Ready to Analyze</h3>
                <p className="empty-state-text">
                  Upload your resume and paste a job description to get AI-powered insights.
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px', borderWidth: 3 }} />
                <p className="loading-text">Analyzing your resume with AI...</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '8px' }}>
                  Checking keywords, skills, and ATS compatibility
                </p>
              </div>
            </div>
          )}

          {analysis && !analyzing && (
            <>
              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  Analysis
                </button>
                <button
                  className={`tab ${activeTab === 'optimized' ? 'active' : ''}`}
                  onClick={() => setActiveTab('optimized')}
                  disabled={!optimized}
                  style={{ opacity: optimized ? 1 : 0.5 }}
                >
                  Optimized {optimized && '✓'}
                </button>
                <button
                  className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
                  onClick={() => setActiveTab('comparison')}
                  disabled={!optimized}
                  style={{ opacity: optimized ? 1 : 0.5 }}
                >
                  Compare
                </button>
              </div>

              {activeTab === 'analysis' && (
                <div className="analysis-results animate-slide-up">
                  {/* Score Cards Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                    <div className="result-section" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                      <ScoreRing score={analysis.atsScore} size={100} label="ATS Score" />
                    </div>
                    <div className="result-section" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                      <ScoreRing score={analysis.matchScore} size={100} label="Match" />
                    </div>
                    <div className="result-section" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={24} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                      <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--success)' }}>
                        +{analysis.improvementPotential}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        Potential Gain
                      </span>
                    </div>
                  </div>

                  {/* Should Apply */}
                  <div className={`should-apply ${analysis.shouldApply}`}>
                    {analysis.shouldApply === 'yes' ? <CheckCircle size={24} /> :
                     analysis.shouldApply === 'no' ? <XCircle size={24} /> :
                     <AlertTriangle size={24} />}
                    <div>
                      <div style={{ fontSize: 'var(--font-size-md)', marginBottom: '4px' }}>
                        Should you apply? <strong>{analysis.shouldApply === 'yes' ? 'Yes!' : analysis.shouldApply === 'no' ? 'Not yet' : 'Maybe'}</strong>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, opacity: 0.8 }}>
                        {analysis.applyReasoning}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="result-section">
                    <div
                      className="result-section-title"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSection('keywords')}
                    >
                      <Award size={18} />
                      Keywords Analysis ({analysis.presentKeywords.length}/{analysis.totalJDKeywords})
                      {expandedSections.keywords ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {expandedSections.keywords !== false && (
                      <div className="keyword-list">
                        {analysis.presentKeywords.map((k, i) => (
                          <span key={`p-${i}`} className="keyword-tag present">✓ {k}</span>
                        ))}
                        {analysis.missingKeywords.map((k, i) => (
                          <span key={`m-${i}`} className="keyword-tag missing">✗ {k}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skill Gaps */}
                  {analysis.skillGaps.length > 0 && (
                    <div className="result-section">
                      <div
                        className="result-section-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSection('gaps')}
                      >
                        <Zap size={18} />
                        Skill Gaps ({analysis.skillGaps.length})
                        {expandedSections.gaps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                      {expandedSections.gaps !== false && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {analysis.skillGaps.map((gap, i) => (
                            <div key={i} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: 'var(--bg-input)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-sm)'
                            }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{gap.skill}</span>
                              <span className={`status-badge ${gap.importance === 'High' ? 'rejected' : 'oa'}`}>
                                {gap.importance}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section Feedback */}
                  <div className="result-section">
                    <div
                      className="result-section-title"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSection('sections')}
                    >
                      <BarChart2 size={18} />
                      Section-wise Feedback
                      {expandedSections.sections ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {expandedSections.sections !== false && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {analysis.sectionFeedback.map((section, i) => (
                          <div key={i} className="improvement-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="improvement-section-name">{section.name}</span>
                              <span className={`status-badge ${
                                section.quality === 'Good' ? 'offer' :
                                section.quality === 'Missing' ? 'rejected' : 'interview'
                              }`}>
                                {section.quality}
                              </span>
                            </div>
                            <p className="improvement-text">{section.feedback}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleOptimize}
                      disabled={optimizing}
                      style={{ flex: 1 }}
                    >
                      {optimizing ? (
                        <>
                          <span className="spinner" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Optimize Resume
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleSendToJobs}
                    >
                      <ArrowRight size={18} />
                      Add to Jobs
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'optimized' && optimized && (
                <div className="analysis-results animate-slide-up">
                  {/* New Score */}
                  <div className="result-section" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Original</div>
                        <ScoreRing score={analysis.atsScore} size={90} label="ATS" />
                      </div>
                      <ArrowRight size={24} style={{ color: 'var(--accent-primary)' }} />
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--success)', marginBottom: '4px', fontWeight: 600 }}>Optimized</div>
                        <ScoreRing score={optimized.newAtsScore} size={90} label="ATS" />
                      </div>
                    </div>
                  </div>

                  {/* Added Keywords */}
                  <div className="result-section">
                    <div className="result-section-title">
                      <Sparkles size={18} />
                      Keywords Added
                    </div>
                    <div className="keyword-list">
                      {optimized.addedKeywords.map((k, i) => (
                        <span key={i} className="keyword-tag added">+ {k}</span>
                      ))}
                    </div>
                  </div>

                  {/* Section Improvements */}
                  {optimized.sectionImprovements.length > 0 && (
                    <div className="result-section">
                      <div className="result-section-title">
                        <TrendingUp size={18} />
                        Section Improvements
                      </div>
                      {optimized.sectionImprovements.map((imp, i) => (
                        <div key={i} className="improvement-item">
                          <div className="improvement-section-name">{imp.section}</div>
                          <p className="improvement-text">{imp.improvement}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Download & Send */}
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDownload}>
                      <Download size={18} />
                      Download Resume
                    </button>
                    <button className="btn btn-secondary" onClick={handleSendToJobs}>
                      <ArrowRight size={18} />
                      Add to Jobs
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'comparison' && optimized && (
                <div className="analysis-results animate-slide-up">
                  <div className="comparison-view">
                    <div className="comparison-panel">
                      <div className="comparison-panel-title">
                        <Eye size={14} /> Original (ATS: {analysis.atsScore})
                      </div>
                      <pre style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                        maxHeight: '400px',
                        overflow: 'auto'
                      }}>
                        {resumeText.slice(0, 2000)}
                      </pre>
                    </div>
                    <div className="comparison-panel" style={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                      <div className="comparison-panel-title" style={{ color: 'var(--success)' }}>
                        <Sparkles size={14} /> Optimized (ATS: {optimized.newAtsScore})
                      </div>
                      <pre style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                        maxHeight: '400px',
                        overflow: 'auto'
                      }}>
                        {optimized.optimizedText.slice(0, 2000)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
