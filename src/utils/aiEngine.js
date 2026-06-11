// AI Analysis Engine - Simulated AI for resume analysis
// This processes text-based analysis and generates realistic results.
// Can be swapped for a real API (OpenAI, Gemini, etc.) later.

const COMMON_KEYWORDS = {
  'software engineer': ['javascript', 'python', 'react', 'node', 'typescript', 'api', 'rest', 'sql', 'git', 'agile', 'docker', 'aws', 'ci/cd', 'testing', 'microservices', 'frontend', 'backend', 'full-stack', 'algorithms', 'data structures', 'system design', 'cloud', 'kubernetes', 'graphql', 'mongodb', 'postgresql'],
  'data scientist': ['python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'sql', 'statistics', 'nlp', 'computer vision', 'data visualization', 'scikit-learn', 'big data', 'spark', 'r', 'tableau', 'jupyter', 'feature engineering', 'a/b testing'],
  'product manager': ['roadmap', 'agile', 'scrum', 'user research', 'stakeholder', 'metrics', 'kpi', 'prioritization', 'product strategy', 'user stories', 'a/b testing', 'analytics', 'cross-functional', 'go-to-market', 'product lifecycle'],
  'data analyst': ['sql', 'excel', 'python', 'tableau', 'power bi', 'data visualization', 'statistics', 'reporting', 'etl', 'data modeling', 'analytics', 'dashboards', 'business intelligence', 'data warehousing'],
  'devops': ['docker', 'kubernetes', 'aws', 'terraform', 'ci/cd', 'jenkins', 'linux', 'ansible', 'monitoring', 'cloud', 'infrastructure', 'automation', 'scripting', 'git', 'networking'],
  'default': ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'project management', 'detail-oriented', 'time management', 'adaptable', 'creative']
};

const SECTION_NAMES = ['Summary', 'Experience', 'Skills', 'Education', 'Projects', 'Certifications'];

function extractKeywords(text) {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-z0-9\s\/\-\+\.#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function findBestCategory(jobDescription) {
  const jdLower = jobDescription.toLowerCase();
  let bestCategory = 'default';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(COMMON_KEYWORDS)) {
    if (category === 'default') continue;
    const matches = keywords.filter(k => jdLower.includes(k)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestCategory = category;
    }
  }
  return bestCategory;
}

export function analyzeResume(resumeText, jobDescription, companyName = '', jobTitle = '') {
  const resumeWords = extractKeywords(resumeText);
  const jdWords = extractKeywords(jobDescription);
  const resumeSet = new Set(resumeWords);
  const jdSet = new Set(jdWords);

  const category = findBestCategory(jobDescription);
  const relevantKeywords = [...COMMON_KEYWORDS[category], ...COMMON_KEYWORDS['default']];

  // Find keywords present and missing
  const jdKeywords = relevantKeywords.filter(k =>
    jobDescription.toLowerCase().includes(k)
  );

  const presentKeywords = jdKeywords.filter(k =>
    resumeText.toLowerCase().includes(k)
  );

  const missingKeywords = jdKeywords.filter(k =>
    !resumeText.toLowerCase().includes(k)
  );

  // Calculate ATS Score
  const keywordScore = jdKeywords.length > 0
    ? (presentKeywords.length / jdKeywords.length) * 100
    : 50;

  // Common word overlap
  const jdCommon = [...jdSet].filter(w => w.length > 3);
  const overlapCount = jdCommon.filter(w => resumeSet.has(w)).length;
  const overlapScore = jdCommon.length > 0 ? (overlapCount / jdCommon.length) * 100 : 50;

  // Format score based on resume length
  const lengthScore = resumeText.length > 500 ? 15 : (resumeText.length > 200 ? 10 : 5);

  // Combined ATS score
  const atsScore = Math.min(100, Math.round(
    keywordScore * 0.5 + overlapScore * 0.35 + lengthScore
  ));

  // Match percentage
  const matchScore = Math.min(100, Math.round(
    keywordScore * 0.6 + overlapScore * 0.4
  ));

  // Should apply calculation
  let shouldApply = 'yes';
  let applyReasoning = '';
  if (atsScore >= 70) {
    shouldApply = 'yes';
    applyReasoning = `Strong match! Your resume aligns well with the job requirements. ${presentKeywords.length} of ${jdKeywords.length} key skills matched.`;
  } else if (atsScore >= 45) {
    shouldApply = 'maybe';
    applyReasoning = `Moderate match. Your resume covers some requirements but missing ${missingKeywords.length} key skills. Consider optimizing before applying.`;
  } else {
    shouldApply = 'no';
    applyReasoning = `Low match. Your resume is missing significant requirements. Consider gaining skills in: ${missingKeywords.slice(0, 5).join(', ')}.`;
  }

  // Estimate improvement potential
  const improvementPotential = Math.min(30, Math.round(missingKeywords.length * 3));

  // Strengths
  const strengths = presentKeywords.slice(0, 8).map(k => ({
    keyword: k,
    context: `Strong mention of "${k}" in your resume`
  }));

  // Skill gaps
  const skillGaps = missingKeywords.slice(0, 10).map(k => ({
    skill: k,
    importance: jdWords.filter(w => w === k).length > 1 ? 'High' : 'Medium',
    suggestion: `Add "${k}" to relevant experience or skills section`
  }));

  // Section-wise feedback
  const sectionFeedback = SECTION_NAMES.map(section => {
    const sectionLower = section.toLowerCase();
    const hasSection = resumeText.toLowerCase().includes(sectionLower);
    return {
      name: section,
      present: hasSection,
      quality: hasSection ? (Math.random() > 0.3 ? 'Good' : 'Needs Improvement') : 'Missing',
      feedback: hasSection
        ? `${section} section found. Consider adding more quantified achievements and relevant keywords.`
        : `${section} section is missing or not clearly labeled. Consider adding a clear "${section}" section.`
    };
  });

  return {
    atsScore,
    matchScore,
    shouldApply,
    applyReasoning,
    improvementPotential,
    presentKeywords,
    missingKeywords,
    strengths,
    skillGaps,
    sectionFeedback,
    category,
    totalJDKeywords: jdKeywords.length,
  };
}

export function generateOptimizedResume(resumeText, jobDescription, analysis) {
  let optimized = resumeText;

  // Add missing keywords into skills section
  if (analysis.missingKeywords.length > 0) {
    const skillsToAdd = analysis.missingKeywords.slice(0, 8);
    const skillsLine = `\n\nAdditional Skills: ${skillsToAdd.map(s =>
      s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(', ')}`;

    // Try to insert near skills section
    const skillsIndex = optimized.toLowerCase().indexOf('skills');
    if (skillsIndex !== -1) {
      const lineEnd = optimized.indexOf('\n', skillsIndex + 50);
      if (lineEnd !== -1) {
        optimized = optimized.slice(0, lineEnd) + skillsLine + optimized.slice(lineEnd);
      } else {
        optimized += skillsLine;
      }
    } else {
      optimized += skillsLine;
    }
  }

  // Generate improvement highlights
  const improvements = analysis.missingKeywords.slice(0, 8).map(k => ({
    keyword: k,
    action: 'Added',
    section: 'Skills'
  }));

  const sectionImprovements = analysis.sectionFeedback
    .filter(s => s.quality !== 'Good')
    .map(s => ({
      section: s.name,
      improvement: s.feedback
    }));

  // New ATS score (simulated improvement)
  const newAtsScore = Math.min(98, analysis.atsScore + analysis.improvementPotential);

  return {
    optimizedText: optimized,
    newAtsScore,
    improvements,
    sectionImprovements,
    addedKeywords: analysis.missingKeywords.slice(0, 8)
  };
}

export function generatePrepPlan(job) {
  const stages = {
    'Applied': {
      title: 'Post-Application Tips',
      plan: [
        'Follow up with a LinkedIn connection request to the hiring manager',
        'Research the company culture and recent news',
        'Prepare talking points about why you want this role',
        'Review the job description and identify key requirements'
      ],
      questions: [
        'Tell me about yourself and why you are interested in this role',
        `What do you know about ${job.company}?`,
        'Why are you looking to leave your current position?',
        'What are your salary expectations?'
      ]
    },
    'Online Assessment': {
      title: 'OA Preparation',
      plan: [
        'Practice coding problems on LeetCode (focus on Medium difficulty)',
        'Review common data structures: arrays, hashmaps, trees, graphs',
        'Practice time management - most OAs are timed',
        'Review system design basics if applicable'
      ],
      questions: [
        'Two Sum, Valid Parentheses, Merge Intervals',
        'Binary Tree traversals and operations',
        'Dynamic Programming basics',
        'String manipulation and array problems'
      ]
    },
    'Recruiter Interview': {
      title: 'Recruiter Screen Prep',
      plan: [
        'Prepare your "elevator pitch" (2-minute summary)',
        'Research the company mission, values, and recent developments',
        'Prepare questions about the team, role, and growth opportunities',
        'Know your timeline and availability'
      ],
      questions: [
        'Walk me through your resume',
        'Why this company and this role?',
        'What is your biggest professional achievement?',
        'What are your strengths and areas for growth?',
        'Where do you see yourself in 5 years?'
      ]
    },
    'Technical Interview': {
      title: 'Technical Interview Prep',
      plan: [
        'Review core CS fundamentals and problem-solving patterns',
        'Practice on LeetCode/HackerRank (aim for 2-3 problems daily)',
        'Review system design concepts for your level',
        `Study ${job.company}'s tech stack and engineering blog`,
        'Practice explaining your thought process out loud'
      ],
      questions: [
        'Design a URL shortener / Rate limiter / Chat system',
        'Implement LRU Cache',
        'Solve graph/tree traversal problems',
        'Explain the architecture of a project you built',
        'How would you optimize a slow API endpoint?'
      ]
    },
    'Final Round': {
      title: 'Final Round Prep',
      plan: [
        'Review all previous interview feedback and adjust',
        'Prepare behavioral answers using STAR method',
        'Research team members you may interview with',
        'Prepare thoughtful questions showing deep interest',
        'Review your portfolio/projects for detailed discussions'
      ],
      questions: [
        'Tell me about a time you handled a conflict',
        'Describe your most challenging project',
        'How do you prioritize when everything is urgent?',
        'What would you do in your first 90 days?',
        'How do you mentor junior engineers?'
      ]
    }
  };

  return stages[job.status] || stages['Applied'];
}

export function extractJobDetails(jobDescription) {
  if (!jobDescription) return { company: 'Target Company', title: 'Specialist', skills: [], requirements: [], experience_level: 'Not specified' };
  
  const jdLower = jobDescription.toLowerCase();
  
  // Try to find company name
  let company = 'Target Company';
  const companyMatch = jobDescription.match(/(?:at|join|role\s+at)\s+([A-Z][a-zA-Z0-9\s]{1,20})(?:\s+is|\s+to|\s+team|\b)/);
  if (companyMatch && companyMatch[1]) {
    company = companyMatch[1].trim();
  } else {
    // Look at first line
    const firstLine = jobDescription.split('\n')[0];
    const aboutMatch = firstLine.match(/(?:about|for|at)\s+([A-Z][a-zA-Z0-9\s]{1,20})/i);
    if (aboutMatch && aboutMatch[1]) company = aboutMatch[1].trim();
  }
  
  // Try to find job title
  let title = 'Professional';
  const titles = [
    'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
    'Data Scientist', 'Data Analyst', 'Product Manager', 'Project Manager',
    'DevOps Engineer', 'Security Engineer', 'UX Designer', 'Product Designer',
    'QA Engineer', 'Solutions Architect', 'Engineering Manager'
  ];
  for (const t of titles) {
    if (jdLower.includes(t.toLowerCase())) {
      title = t;
      break;
    }
  }
  
  // Extract skills
  const COMMON_KEYS = {
    ...COMMON_KEYWORDS,
    'javascript': ['js', 'es6', 'react', 'vue', 'angular', 'node', 'express'],
    'python': ['django', 'flask', 'fastapi', 'numpy', 'pandas', 'scikit-learn']
  };
  const allSkills = new Set();
  for (const [category, keywords] of Object.entries(COMMON_KEYS)) {
    if (Array.isArray(keywords)) {
      keywords.forEach(kw => {
        const regex = new RegExp('\\b' + kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i');
        if (regex.test(jdLower)) {
          allSkills.add(kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
      });
    }
  }
  const skills = Array.from(allSkills).slice(0, 12);
  
  // Extract requirements
  const requirements = [];
  const lines = jobDescription.split('\n');
  let inReqSection = false;
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    
    if (/(?:requirements|qualifications|what\s+you|look\s+for|skills\s+required|must\s+have)/i.test(cleanLine)) {
      inReqSection = true;
      continue;
    }
    
    if (inReqSection && /(?:about|responsibilities|benefits|apply|compensation|what\s+we)/i.test(cleanLine) && !cleanLine.startsWith('-') && !cleanLine.startsWith('*')) {
      inReqSection = false;
    }
    
    if (inReqSection && (cleanLine.startsWith('-') || cleanLine.startsWith('*') || cleanLine.startsWith('•') || /^\d+\./.test(cleanLine))) {
      requirements.push(cleanLine.replace(/^[-*•\d\.\s]+/, '').trim());
    } else if (!inReqSection && requirements.length < 5 && /(?:experience\s+with|proficient\s+in|familiar\s+with|ability\s+to)/i.test(cleanLine)) {
      requirements.push(cleanLine.replace(/^[-*•\d\.\s]+/, '').trim());
    }
  }
  
  if (requirements.length === 0) {
    lines.filter(l => l.trim().length > 30 && (l.includes('experience') || l.includes('skills') || l.includes('ability'))).slice(0, 5).forEach(l => {
      requirements.push(l.trim().replace(/^[-*•\d\.\s]+/, ''));
    });
  }
  
  // Experience level
  let experience_level = 'Mid-level';
  const expMatch = jobDescription.match(/(\d+)\+?\s*years?/i);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    if (years <= 2) experience_level = 'Junior / Entry';
    else if (years >= 6) experience_level = 'Senior';
    else experience_level = `Mid-level (${years}+ yrs)`;
  } else if (jdLower.includes('senior') || jdLower.includes('lead') || jdLower.includes('principal')) {
    experience_level = 'Senior';
  } else if (jdLower.includes('junior') || jdLower.includes('associate') || jdLower.includes('entry')) {
    experience_level = 'Junior / Entry';
  } else if (jdLower.includes('intern') || jdLower.includes('co-op')) {
    experience_level = 'Internship';
  }
  
  return {
    company,
    title,
    skills,
    requirements: requirements.slice(0, 6),
    experience_level
  };
}

export function prioritizeSkills(userSkills, jobKeywords) {
  if (!userSkills) return [];
  if (!jobKeywords || jobKeywords.length === 0) return userSkills;
  
  const normalizedKeywords = jobKeywords.map(k => k.toLowerCase());
  return [...userSkills].sort((a, b) => {
    const aMatch = normalizedKeywords.some(kw => a.toLowerCase().includes(kw) || kw.includes(a.toLowerCase()));
    const bMatch = normalizedKeywords.some(kw => b.toLowerCase().includes(kw) || kw.includes(b.toLowerCase()));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });
}

export function generateProfessionalSummary(profile, jobDetails) {
  const { company, title, skills } = jobDetails;
  
  // Calculate total years of experience
  let totalYears = 0;
  if (profile.experience && profile.experience.length > 0) {
    profile.experience.forEach(exp => {
      if (exp.dates) {
        const match = exp.dates.match(/(\d{4})/g);
        if (match && match.length === 2) {
          totalYears += Math.max(1, parseInt(match[1]) - parseInt(match[0]));
        } else if (exp.dates.includes('Present') || exp.dates.includes('present')) {
          const startYearMatch = exp.dates.match(/(\d{4})/);
          if (startYearMatch) {
            totalYears += Math.max(1, new Date().getFullYear() - parseInt(startYearMatch[0]));
          }
        }
      }
    });
  }
  if (totalYears === 0) totalYears = 3;
  
  const primarySkill = profile.skills && profile.skills.length > 0 ? profile.skills[0] : 'software development';
  const otherSkills = profile.skills && profile.skills.length > 1 ? profile.skills.slice(1, 4).join(', ') : 'modern technologies';
  
  const sentences = [
    `Results-oriented ${title} with ${totalYears}+ years of experience specializing in ${primarySkill} and ${otherSkills}.`,
    `Demonstrated success driving project efficiency and scalability, with technical skills highly aligned with ${company}'s current requirements.`,
    `Adept at cross-functional collaboration, technical problem-solving, and implementing robust solutions to meet strategic goals.`,
    `Eager to contribute technical expertise and innovative engineering strategies to the ${title} role at ${company}.`
  ];
  
  return sentences.join(' ');
}

export function generateResumeSections(profile, jobDetails) {
  const { title, company, skills } = jobDetails;
  
  // Tailored summary
  const summary = generateProfessionalSummary(profile, jobDetails);
  
  // Tailored skills
  const tailoredSkills = prioritizeSkills(profile.skills || [], skills);
  
  // Tailored experience bullets
  const tailoredExperience = (profile.experience || []).map(exp => {
    const tailoredBullets = (exp.bullets || []).map(bullet => {
      let tailoredBullet = bullet;
      // Inject keywords with some randomness
      if (skills.length > 0 && Math.random() > 0.4) {
        const keySkill = skills[Math.floor(Math.random() * skills.length)];
        if (!bullet.toLowerCase().includes(keySkill.toLowerCase())) {
          if (bullet.endsWith('.')) bullet = bullet.slice(0, -1);
          tailoredBullet = `${bullet}, utilizing ${keySkill} to optimize performance and align with project specifications.`;
        }
      }
      
      if (title.toLowerCase().includes('frontend') && bullet.includes('API')) {
        tailoredBullet = tailoredBullet.replace(/API/g, 'RESTful APIs and frontend integrations');
      }
      if (title.toLowerCase().includes('backend') && bullet.includes('database')) {
        tailoredBullet = tailoredBullet.replace(/database/gi, 'highly optimized PostgreSQL/NoSQL database schemas');
      }
      
      return tailoredBullet;
    });
    
    return {
      ...exp,
      bullets: tailoredBullets
    };
  });

  // Tailored projects
  const tailoredProjects = (profile.projects || []).map(project => {
    let description = project.description || '';
    if (skills.length > 0 && Math.random() > 0.5) {
      const matchSkill = skills.find(s => (project.tech || []).some(t => t.toLowerCase() === s.toLowerCase()));
      if (matchSkill) {
        description += ` (Implemented utilizing ${matchSkill} architecture best practices.)`;
      }
    }
    return {
      ...project,
      description
    };
  });
  
  return {
    ...profile,
    summary,
    skills: tailoredSkills,
    experience: tailoredExperience,
    projects: tailoredProjects
  };
}

export function findCommonGround(userProfile, contactProfile) {
  const common = {
    skills: [],
    schools: [],
    companies: [],
    location: null
  };
  
  if (!userProfile || !contactProfile) return common;
  
  // 1. Common Skills
  const userSkillsSet = new Set((userProfile.skills || []).map(s => s.toLowerCase()));
  const contactSkills = contactProfile.skills || [];
  contactSkills.forEach(skill => {
    if (userSkillsSet.has(skill.toLowerCase())) {
      common.skills.push(skill);
    }
  });
  
  // 2. Common Schools
  const userSchools = (userProfile.education || []).map(edu => (edu.school || '').toLowerCase());
  const contactEdu = (contactProfile.education || '');
  userSchools.forEach(school => {
    if (school && contactEdu.toLowerCase().includes(school)) {
      common.schools.push(school.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  
  // 3. Common Companies
  const userCompanies = (userProfile.experience || []).map(exp => (exp.company || '').toLowerCase());
  const contactExp = contactProfile.experience || [];
  userCompanies.forEach(comp => {
    if (comp && contactExp.some(expStr => expStr.toLowerCase().includes(comp))) {
      common.companies.push(comp.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });
  
  // 4. Common Location
  if (userProfile.location && contactProfile.about && contactProfile.about.toLowerCase().includes(userProfile.location.toLowerCase())) {
    common.location = userProfile.location;
  }
  
  return common;
}

export function generateConnectionNote(userProfile, contactProfile, jobContext, style = 'professional') {
  const name = contactProfile.name ? contactProfile.name.split(' ')[0] : 'there';
  const company = contactProfile.company || (jobContext ? jobContext.company : '');
  const title = contactProfile.title || '';
  const userTitle = userProfile && userProfile.experience && userProfile.experience[0] ? userProfile.experience[0].title : 'Software Engineer';
  
  const common = findCommonGround(userProfile, contactProfile);
  
  let intro = `Hi ${name},`;
  let body = '';
  let callToAction = 'Looking forward to connecting!';
  
  if (style === 'casual') {
    intro = `Hi ${name} 👋`;
    if (common.schools.length > 0) {
      body = `Great to connect with a fellow ${common.schools[0]} alum! I saw your work as a ${title} at ${company} and wanted to reach out to say hi.`;
    } else if (common.companies.length > 0) {
      body = `I noticed we both spent time at ${common.companies[0]}! Great to see what you've been working on as a ${title} at ${company}.`;
    } else if (common.skills.length > 0) {
      body = `I noticed we both work with ${common.skills.slice(0, 2).join(' & ')}. I've been building some interesting projects in this space recently and wanted to connect!`;
    } else {
      body = `I stumbled across your profile and was really impressed by your background as a ${title} at ${company}. I'm also working in this space and wanted to connect!`;
    }
    callToAction = `Would love to connect here and stay in touch.`;
  } else if (style === 'referral_ask') {
    const jobTitle = jobContext ? jobContext.title : 'open opportunities';
    body = `I hope you're doing well. I'm currently looking to join the team at ${company} as a ${jobTitle} and saw you work as a ${title} there. Given your experience, I'd love to ask a quick question about the engineering culture if you have a moment.`;
    if (common.skills.length > 0) {
      body += ` I have a background in ${common.skills.slice(0, 2).join(' & ')} which seems very relevant to the team's goals.`;
    }
    callToAction = `If you have 5 minutes sometime, I would be incredibly grateful to connect. Either way, appreciate your time!`;
  } else { // professional
    if (common.companies.length > 0 || common.schools.length > 0) {
      body = `I am reaching out as a fellow ${common.schools[0] || common.companies[0]} connection. I admire your work at ${company} as a ${title} and would love to connect to learn more about your team's direction and experiences.`;
    } else {
      body = `I'm a ${userTitle} interested in the engineering space at ${company}. I came across your profile and was very impressed by your career trajectory as a ${title}.`;
    }
    callToAction = `I would appreciate the opportunity to connect and stay in touch.`;
  }
  
  return `${intro}\n\n${body}\n\n${callToAction}`;
}

export function generateFollowUpNote(userProfile, contactProfile, previousInteraction = '') {
  const name = contactProfile.name ? contactProfile.name.split(' ')[0] : 'there';
  const company = contactProfile.company || 'your team';
  
  return `Hi ${name},\n\nHope you're doing well! Just wanted to follow up on my previous note. I'm still very interested in learning more about the engineering environment at ${company}.\n\nIf you have a quick moment this week, I'd love to connect. If not, no worries at all!\n\nBest,\n[Your Name]`;
}
