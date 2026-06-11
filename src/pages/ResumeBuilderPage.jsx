import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  Sparkles, Download, CheckCircle, ArrowRight, ArrowLeft,
  FileText, Briefcase, GraduationCap, Award, Plus, Trash2, Edit2, Layout
} from 'lucide-react';
import { extractJobDetails, generateResumeSections } from '../utils/aiEngine';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const defaultProfile = {
  name: 'Koushik Goud',
  email: 'koushik@email.com',
  phone: '555-0123',
  location: 'Des Moines, IA',
  linkedin: 'linkedin.com/in/koushik',
  github: 'github.com/koushik',
  summary: '',
  experience: [
    { title: 'Software Engineer', company: 'Acme Corp', dates: '2024 - Present', bullets: ['Developed high-performance web applications using React and Node.js.', 'Collaborated with cross-functional teams to implement responsive design patterns.', 'Reduced API response times by 30% through optimization.'] }
  ],
  education: [
    { school: 'Iowa State University', degree: 'B.S. in Computer Science', year: '2024' }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Agile'],
  projects: [
    { name: 'CareerAI', description: 'AI-powered job application tracking and resume optimizer dashboard.', tech: ['React', 'Vite', 'CSS'] }
  ]
};

export default function ResumeBuilderPage() {
  const { userProfile, setUserProfile, addResume } = useData();
  const [step, setStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDetails, setJobDetails] = useState({
    company: '',
    title: '',
    skills: [],
    requirements: [],
    experience_level: ''
  });

  const [profile, setProfile] = useState(defaultProfile);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sync state with Context once loaded
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleExtractJob = () => {
    if (!jobDescription.trim()) return;
    setExtracting(true);
    setTimeout(() => {
      const details = extractJobDetails(jobDescription);
      setJobDetails(details);
      setExtracting(false);
      setStep(2);
    }, 1200);
  };

  const handleSaveProfile = () => {
    setUserProfile(profile);
    setTailoring(true);
    setTimeout(() => {
      const tailored = generateResumeSections(profile, jobDetails);
      setTailoredResume(tailored);
      setTailoring(false);
      setStep(3);
    }, 1500);
  };

  // Profile Form Helpers
  const handleProfileChange = (key, val) => {
    setProfile(prev => ({ ...prev, [key]: val }));
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', dates: '', bullets: [''] }]
    }));
  };

  const updateExperience = (index, key, val) => {
    setProfile(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, experience: updated };
    });
  };

  const deleteExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addExpBullet = (jobIndex) => {
    setProfile(prev => {
      const updated = [...prev.experience];
      updated[jobIndex] = {
        ...updated[jobIndex],
        bullets: [...updated[jobIndex].bullets, '']
      };
      return { ...prev, experience: updated };
    });
  };

  const updateExpBullet = (jobIndex, bulletIndex, val) => {
    setProfile(prev => {
      const updated = [...prev.experience];
      const newBullets = [...updated[jobIndex].bullets];
      newBullets[bulletIndex] = val;
      updated[jobIndex] = { ...updated[jobIndex], bullets: newBullets };
      return { ...prev, experience: updated };
    });
  };

  const deleteExpBullet = (jobIndex, bulletIndex) => {
    setProfile(prev => {
      const updated = [...prev.experience];
      updated[jobIndex] = {
        ...updated[jobIndex],
        bullets: updated[jobIndex].bullets.filter((_, i) => i !== bulletIndex)
      };
      return { ...prev, experience: updated };
    });
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', year: '' }]
    }));
  };

  const updateEducation = (index, key, val) => {
    setProfile(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, education: updated };
    });
  };

  const deleteEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', tech: [''] }]
    }));
  };

  const updateProject = (index, key, val) => {
    setProfile(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [key]: val };
      return { ...prev, projects: updated };
    });
  };

  const deleteProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Skills as tags
  const handleSkillsChange = (e) => {
    const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    handleProfileChange('skills', list);
  };

  // Tailored Resume Edits
  const handleTailoredResumeChange = (key, val) => {
    setTailoredResume(prev => ({ ...prev, [key]: val }));
  };

  const handleTailoredExpBulletChange = (jobIndex, bulletIndex, val) => {
    setTailoredResume(prev => {
      const updated = [...prev.experience];
      const newBullets = [...updated[jobIndex].bullets];
      newBullets[bulletIndex] = val;
      updated[jobIndex] = { ...updated[jobIndex], bullets: newBullets };
      return { ...prev, experience: updated };
    });
  };

  const handleExportPDF = async () => {
    if (!tailoredResume) return;
    setExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let y = height - 50;
      const x = 50;
      const contentWidth = width - 100;
      
      const drawText = (text, size, isBold = false, spaceAfter = 12) => {
        const activeFont = isBold ? boldFont : font;
        const words = (text || '').split(' ');
        let line = '';
        const lines = [];
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = activeFont.widthOfTextAtSize(testLine, size);
          if (testWidth > contentWidth) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        for (const currentLine of lines) {
          if (y < 40) {
            page = pdfDoc.addPage([612, 792]);
            y = 742;
          }
          page.drawText(currentLine, {
            x,
            y,
            size,
            font: activeFont,
            color: rgb(0.1, 0.1, 0.1)
          });
          y -= (size + 3);
        }
        y -= spaceAfter;
      };

      // Header
      drawText(tailoredResume.name, 18, true, 4);
      drawText(`${tailoredResume.email} | ${tailoredResume.phone} | ${tailoredResume.location}`, 9, false, 4);
      drawText(`${tailoredResume.linkedin} | ${tailoredResume.github}`, 9, false, 15);
      
      page.drawLine({
        start: { x, y: y + 8 },
        end: { x: width - x, y: y + 8 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7)
      });
      
      // Summary
      if (tailoredResume.summary) {
        drawText('PROFESSIONAL SUMMARY', 11, true, 6);
        drawText(tailoredResume.summary, 9, false, 12);
      }
      
      // Experience
      if (tailoredResume.experience && tailoredResume.experience.length > 0) {
        drawText('EXPERIENCE', 11, true, 6);
        tailoredResume.experience.forEach(exp => {
          drawText(`${exp.title} | ${exp.company}`, 10, true, 2);
          drawText(exp.dates, 8, false, 4);
          if (exp.bullets) {
            exp.bullets.forEach(bullet => {
              drawText(`• ${bullet}`, 9, false, 3);
            });
          }
          y -= 6;
        });
        y -= 6;
      }
      
      // Skills
      if (tailoredResume.skills && tailoredResume.skills.length > 0) {
        drawText('SKILLS', 11, true, 6);
        drawText(tailoredResume.skills.join(', '), 9, false, 12);
      }
      
      // Projects
      if (tailoredResume.projects && tailoredResume.projects.length > 0) {
        drawText('PROJECTS', 11, true, 6);
        tailoredResume.projects.forEach(project => {
          const techStr = Array.isArray(project.tech) ? project.tech.join(', ') : project.tech;
          drawText(`${project.name} (${techStr || ''})`, 10, true, 4);
          drawText(project.description, 9, false, 8);
        });
        y -= 6;
      }

      // Education
      if (tailoredResume.education && tailoredResume.education.length > 0) {
        drawText('EDUCATION', 11, true, 6);
        tailoredResume.education.forEach(edu => {
          drawText(`${edu.degree} - ${edu.school} (${edu.year})`, 9, false, 4);
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tailored_Resume_${jobDetails.company.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Save to Resumes list in Context
      addResume({
        company: jobDetails.company || 'Tailored Job',
        jobTitle: jobDetails.title || 'Specialist',
        atsScore: 90,
        fileName: `Tailored_Resume_${jobDetails.company.replace(/\s+/g, '_')}.pdf`
      });

      setStep(4);
    } catch (err) {
      console.error(err);
      alert('Error generating PDF. Please check configuration.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="resume-builder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">AI Resume Builder</h1>
            <p className="page-description">
              Create a fully tailored, ATS-friendly resume for your target job description in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="builder-steps">
        <div className={`step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">{step > 1 ? <CheckCircle size={16} /> : '1'}</div>
          <span className="step-label">Job Details</span>
        </div>
        <div className="step-line" />
        <div className={`step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">{step > 2 ? <CheckCircle size={16} /> : '2'}</div>
          <span className="step-label">Your Profile</span>
        </div>
        <div className="step-line" />
        <div className={`step-node ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="step-number">{step > 3 ? <CheckCircle size={16} /> : '3'}</div>
          <span className="step-label">Tailored Resume</span>
        </div>
        <div className="step-line" />
        <div className={`step-node ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <span className="step-label">Export PDF</span>
        </div>
      </div>

      {/* Step 1: Job Description Input */}
      {step === 1 && (
        <div className="card animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              Paste Target Job Description
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              We will extract the required skills, requirements, and keywords from the job description to tailor your resume specifically to this position.
            </p>
            
            <textarea
              className="form-input"
              rows={12}
              placeholder="Paste the full job description here (responsibilities, skills, requirements, etc.)..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
            
            <button
              className="btn btn-primary btn-lg"
              onClick={handleExtractJob}
              disabled={!jobDescription.trim() || extracting}
              style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-sm)' }}
            >
              {extracting ? (
                <>
                  <span className="spinner" />
                  Analyzing Job Details...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze & Tailor Profile
                  <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Edit Profile */}
      {step === 2 && (
        <div className="card animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} />
              Confirm Your Profile Data
            </h3>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Tailoring for: <strong>{jobDetails.title}</strong> at <strong>{jobDetails.company}</strong> ({jobDetails.experience_level})
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            
            {/* Contact Details */}
            <div className="form-section-group">
              <h4 className="form-section-title">Personal Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.name}
                    onChange={e => handleProfileChange('name', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profile.email}
                    onChange={e => handleProfileChange('email', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.phone}
                    onChange={e => handleProfileChange('phone', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.location}
                    onChange={e => handleProfileChange('location', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.linkedin}
                    onChange={e => handleProfileChange('linkedin', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.github}
                    onChange={e => handleProfileChange('github', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="form-section-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 className="form-section-title" style={{ margin: 0 }}>Work Experience</h4>
                <button className="btn btn-secondary btn-sm" onClick={addExperience}>
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              {profile.experience.map((exp, expIdx) => (
                <div key={expIdx} className="builder-item-card">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button className="btn-icon text-rejected" onClick={() => deleteExperience(expIdx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Role Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.title}
                        onChange={e => updateExperience(expIdx, 'title', e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="e.g. Frontend Engineer"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.company}
                        onChange={e => updateExperience(expIdx, 'company', e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="e.g. Stripe"
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Dates / Duration</label>
                      <input
                        type="text"
                        className="form-input"
                        value={exp.dates}
                        onChange={e => updateExperience(expIdx, 'dates', e.target.value)}
                        style={{ width: '100%' }}
                        placeholder="e.g. 2024 - Present or Jan 2022 - Mar 2024"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label">Bullet Achievements</label>
                      <button className="btn btn-secondary btn-xs" onClick={() => addExpBullet(expIdx)}>
                        <Plus size={12} /> Add Bullet
                      </button>
                    </div>
                    {exp.bullets.map((bullet, bulIdx) => (
                      <div key={bulIdx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: 'var(--font-size-sm)' }}>•</span>
                        <input
                          type="text"
                          className="form-input"
                          value={bullet}
                          onChange={e => updateExpBullet(expIdx, bulIdx, e.target.value)}
                          style={{ flex: 1 }}
                          placeholder="Quantify results if possible (e.g. 'Improved efficiency by 20%')"
                        />
                        <button className="btn-icon text-rejected" onClick={() => deleteExpBullet(expIdx, bulIdx)} style={{ padding: '0 4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="form-section-group">
              <h4 className="form-section-title">Core Skills</h4>
              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={profile.skills.join(', ')}
                  onChange={handleSkillsChange}
                  style={{ width: '100%', marginTop: '4px' }}
                  placeholder="React, TypeScript, Node.js, Python..."
                />
              </div>
            </div>

            {/* Projects */}
            <div className="form-section-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 className="form-section-title" style={{ margin: 0 }}>Projects</h4>
                <button className="btn btn-secondary btn-sm" onClick={addProject}>
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {profile.projects.map((project, projIdx) => (
                <div key={projIdx} className="builder-item-card">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                    <button className="btn-icon text-rejected" onClick={() => deleteProject(projIdx)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: '8px' }}>
                    <div className="form-group">
                      <label className="form-label">Project Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={project.name}
                        onChange={e => updateProject(projIdx, 'name', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tech Stack (comma-separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={Array.isArray(project.tech) ? project.tech.join(', ') : project.tech}
                        onChange={e => updateProject(projIdx, 'tech', e.target.value.split(',').map(t => t.trim()))}
                        style={{ width: '100%' }}
                        placeholder="React, Firebase, Tailwind"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={project.description}
                      onChange={e => updateProject(projIdx, 'description', e.target.value)}
                      style={{ width: '100%' }}
                      placeholder="Briefly describe what you built and the impact..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="form-section-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 className="form-section-title" style={{ margin: 0 }}>Education</h4>
                <button className="btn btn-secondary btn-sm" onClick={addEducation}>
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {profile.education.map((edu, eduIdx) => (
                <div key={eduIdx} className="builder-item-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 40px', gap: '12px', alignItems: 'end' }}>
                  <div className="form-group">
                    <label className="form-label">School / University</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.school}
                      onChange={e => updateEducation(eduIdx, 'school', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree & Major</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.degree}
                      onChange={e => updateEducation(eduIdx, 'degree', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.year}
                      onChange={e => updateEducation(eduIdx, 'year', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button className="btn-icon text-rejected" onClick={() => deleteEducation(eduIdx)} style={{ marginBottom: '10px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-md)' }}>
              <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>
                <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Back
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleSaveProfile} disabled={tailoring}>
                {tailoring ? (
                  <>
                    <span className="spinner" />
                    Tailoring Resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Tailored Resume
                    <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Step 3: Live Preview & Tailored Edits */}
      {step === 3 && tailoredResume && (
        <div className="builder-split-layout animate-slide-up">
          
          {/* Edit Section */}
          <div className="card scrollable-card" style={{ height: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={18} style={{ color: 'var(--accent-primary)' }} />
                Review & Edit Tailored Content
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Below are the AI-tailored sections. The professional summary has been rewritten and keywords have been woven into experience points. Make any direct edits here.
              </p>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Tailored Summary</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={tailoredResume.summary}
                  onChange={e => handleTailoredResumeChange('summary', e.target.value)}
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              {tailoredResume.experience.map((exp, jobIdx) => (
                <div key={jobIdx} style={{ padding: 'var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    {exp.title} at {exp.company}
                  </h4>
                  {exp.bullets.map((bullet, bulIdx) => (
                    <div key={bulIdx} className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Bullet {bulIdx + 1}</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={bullet}
                        onChange={e => handleTailoredExpBulletChange(jobIdx, bulIdx, e.target.value)}
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-md)' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back to Form
                </button>
                <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
                  {exporting ? (
                    <>
                      <span className="spinner" />
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export to PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="card preview-card" style={{ height: 'calc(100vh - 280px)', overflowY: 'auto', background: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
              <Layout size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--text-muted)' }}>ATS-Optimized Preview</span>
            </div>

            <div className="resume-pdf-mockup">
              <div className="resume-header" style={{ textAlign: 'center', borderBottom: '1.5px solid #111827', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tailoredResume.name}</h2>
                <div style={{ fontSize: '11px', color: '#4B5563', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{tailoredResume.email}</span>
                  <span>•</span>
                  <span>{tailoredResume.phone}</span>
                  <span>•</span>
                  <span>{tailoredResume.location}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ textDecoration: 'underline' }}>{tailoredResume.linkedin}</span>
                  <span>{tailoredResume.github && '•'}</span>
                  <span style={{ textDecoration: 'underline' }}>{tailoredResume.github}</span>
                </div>
              </div>

              {/* Summary */}
              {tailoredResume.summary && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #E5E7EB', paddingBottom: '3px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#111827' }}>
                    Professional Summary
                  </h3>
                  <p style={{ fontSize: '10px', lineHeight: '1.5', margin: '0 0 8px 0', color: '#374151' }}>{tailoredResume.summary}</p>
                </div>
              )}

              {/* Experience */}
              {tailoredResume.experience && tailoredResume.experience.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #E5E7EB', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#111827' }}>
                    Work Experience
                  </h3>
                  {tailoredResume.experience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
                        <span>{exp.title} | {exp.company}</span>
                        <span style={{ fontWeight: 400, color: '#4B5563' }}>{exp.dates}</span>
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '9.5px', color: '#374151', lineHeight: '1.4' }}>
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: '3px' }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {tailoredResume.skills && tailoredResume.skills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #E5E7EB', paddingBottom: '3px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#111827' }}>
                    Skills
                  </h3>
                  <p style={{ fontSize: '9.5px', margin: '0', color: '#374151', lineHeight: '1.4' }}>
                    {tailoredResume.skills.join(', ')}
                  </p>
                </div>
              )}

              {/* Projects */}
              {tailoredResume.projects && tailoredResume.projects.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #E5E7EB', paddingBottom: '3px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#111827' }}>
                    Projects
                  </h3>
                  {tailoredResume.projects.map((project, idx) => (
                    <div key={idx} style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
                        {project.name} <span style={{ fontWeight: 400, color: '#6B7280', fontSize: '9px' }}>({Array.isArray(project.tech) ? project.tech.join(', ') : project.tech})</span>
                      </div>
                      <p style={{ fontSize: '9.5px', margin: '0', color: '#374151', lineHeight: '1.4' }}>{project.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {tailoredResume.education && tailoredResume.education.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, borderBottom: '1px solid #E5E7EB', paddingBottom: '3px', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.3px', color: '#111827' }}>
                    Education
                  </h3>
                  {tailoredResume.education.map((edu, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#374151', marginBottom: '4px' }}>
                      <span><strong>{edu.degree}</strong> - {edu.school}</span>
                      <span style={{ color: '#6B7280' }}>{edu.year}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Step 4: Completed State */}
      {step === 4 && (
        <div className="card animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <div className="success-icon-container" style={{ margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle size={64} style={{ color: 'var(--success)' }} />
          </div>
          
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: '12px' }}>Resume Tailored Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
            Your tailored, ATS-friendly PDF has been downloaded to your system. We have also added this resume configuration to your career profile so you can use it in your job applications.
          </p>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              Tailor Another Resume
            </button>
            <button className="btn btn-primary" onClick={() => {
              // Direct navigation fallback since routing isn't updated yet, or just refresh/reset
              setStep(3);
            }}>
              View Preview Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
