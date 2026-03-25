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
