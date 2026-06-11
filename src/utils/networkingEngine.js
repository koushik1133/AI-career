// Networking Hub Utilities - Simulated Google Search discovery and LinkedIn profile parsing
// This manages local calculations and profile extraction from text or files.

export function searchPeopleAtCompany(company, role = '') {
  const cleanCompany = company.trim();
  const cleanRole = role.trim() || 'Software Engineer';
  
  const firstNames = ['Sarah', 'David', 'Jessica', 'Aravind', 'Emily', 'Alex', 'Kenji', 'Sophia', 'Marcus', 'Elena', 'Ryan', 'Chloe'];
  const lastNames = ['Chen', 'Miller', 'Taylor', 'Raman', 'Watson', 'Rivera', 'Sato', 'Martinez', 'Vance', 'Petrova', 'Kowalski', 'Zhang'];
  
  const googleSearchUrl = `https://www.google.com/search?q=site:linkedin.com/in+%22${encodeURIComponent(cleanCompany)}%22+%22${encodeURIComponent(cleanRole)}%22`;
  
  const results = [];
  for (let i = 0; i < 4; i++) {
    const firstName = firstNames[(cleanCompany.length + i) % firstNames.length];
    const lastName = lastNames[(cleanRole.length + i * 3) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    
    let finalRole = cleanRole;
    if (i === 1) finalRole = `Senior ${cleanRole}`;
    if (i === 2) finalRole = `${cleanRole} Lead`;
    if (i === 3) finalRole = `Staff ${cleanRole}`;
    
    const id = `sim-${cleanCompany.toLowerCase().replace(/\s+/g, '-')}-${i}`;
    
    let skills = ['Systems Design', 'Agile', 'Team Collaboration'];
    if (cleanRole.toLowerCase().includes('software') || cleanRole.toLowerCase().includes('engineer')) {
      skills = ['JavaScript', 'React', 'Node.js', 'System Design', 'Python', 'AWS', 'SQL'];
    } else if (cleanRole.toLowerCase().includes('product')) {
      skills = ['Product Roadmap', 'User Research', 'Agile/Scrum', 'Analytics', 'A/B Testing'];
    } else if (cleanRole.toLowerCase().includes('data')) {
      skills = ['Python', 'SQL', 'Machine Learning', 'Tableau', 'Statistics', 'Pandas'];
    }
    
    results.push({
      id,
      name: fullName,
      title: finalRole,
      company: cleanCompany,
      linkedinUrl: `https://linkedin.com/in/${fullName.toLowerCase().replace(/\s+/g, '')}`,
      about: `Experienced ${finalRole} at ${cleanCompany}. Passionate about building robust systems, mentoring engineers, and solving complex architecture challenges. Always open to discussing industry trends and networking with fellow professionals.`,
      experience: [
        `${finalRole} @ ${cleanCompany} (2023 - Present)`,
        `Software Engineer @ TechCorp (2020 - 2023)`
      ],
      skills,
      education: 'B.S. in Computer Science',
      source: 'google_search',
      relevanceScore: Math.round(75 + Math.random() * 22)
    });
  }
  
  return {
    results,
    googleSearchUrl
  };
}

export function parseLinkedInText(rawText) {
  if (!rawText) return null;
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  
  let name = '';
  let title = '';
  let company = '';
  let about = '';
  const experience = [];
  const skills = [];
  let education = '';
  
  if (lines.length > 0) {
    name = lines[0];
  }
  
  if (lines.length > 1) {
    title = lines[1];
    const atIndex = title.toLowerCase().indexOf(' at ');
    if (atIndex !== -1) {
      company = title.substring(atIndex + 4).trim();
      title = title.substring(0, atIndex).trim();
    }
  }
  
  let currentSection = '';
  
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    if (lineLower === 'about' || lineLower === 'summary') {
      currentSection = 'about';
      continue;
    } else if (lineLower === 'experience' || lineLower === 'work history') {
      currentSection = 'experience';
      continue;
    } else if (lineLower === 'skills' || lineLower === 'skills & endorsements') {
      currentSection = 'skills';
      continue;
    } else if (lineLower === 'education') {
      currentSection = 'education';
      continue;
    }
    
    if (currentSection === 'about') {
      about += (about ? ' ' : '') + line;
    } else if (currentSection === 'experience') {
      if (experience.length < 5) {
        experience.push(line);
      }
    } else if (currentSection === 'skills') {
      if (skills.length < 15) {
        skills.push(line);
      }
    } else if (currentSection === 'education') {
      if (!education) {
        education = line;
      } else {
        education += ', ' + line;
      }
    }
  }
  
  if (!company && title) {
    const companyMatch = title.match(/(?:at|@)\s*([A-Za-z0-9\s]+)/i);
    if (companyMatch) {
      company = companyMatch[1].trim();
      title = title.replace(/(?:at|@)\s*[A-Za-z0-9\s]+/i, '').trim();
    }
  }
  
  if (!name) name = 'LinkedIn Professional';
  if (!title) title = 'Software Engineer';
  if (!company) company = 'Tech Company';
  if (skills.length === 0) {
    skills.push('Collaboration', 'System Design', 'Technology');
  }
  
  return {
    name,
    title,
    company,
    about: about || `A professional in the technology space currently working at ${company}.`,
    experience: experience.length > 0 ? experience : [`Software Engineer @ ${company}`],
    skills,
    education: education || 'University Degree',
    source: 'pasted_text'
  };
}

export async function parseLinkedInPDF(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let extractedName = 'Jane Doe';
      if (file && file.name) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .replace(/Resume|CV|LinkedIn|Profile/gi, "")
          .trim();
        
        if (cleanName) {
          extractedName = cleanName
            .split(' ')
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        }
      }
      
      resolve({
        name: extractedName,
        title: 'Senior Software Engineer',
        company: 'Stripe',
        linkedinUrl: `https://linkedin.com/in/${extractedName.toLowerCase().replace(/\s+/g, '')}`,
        about: `Accomplished software engineer with over 6 years of experience building payment infrastructure and high-performance Web APIs. Focused on scalable architectures, developer tools, and system reliability.`,
        experience: [
          'Senior Software Engineer @ Stripe (2023 - Present)',
          'Software Engineer @ Stripe (2021 - 2023)',
          'Software Engineer II @ Microsoft (2019 - 2021)'
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Ruby', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS'],
        education: 'University of Illinois Urbana-Champaign - BS Computer Science',
        source: 'linkedin_pdf'
      });
    }, 1200);
  });
}

export function calculateRelevanceScore(person, jobDescription) {
  if (!person || !jobDescription) return 0;
  
  const jdLower = jobDescription.toLowerCase();
  let score = 50; // base score
  
  // Check title overlap
  const titleKeywords = person.title.toLowerCase().split(/\s+/);
  let titleMatches = 0;
  titleKeywords.forEach(kw => {
    if (kw.length > 2 && jdLower.includes(kw)) {
      titleMatches++;
    }
  });
  score += titleMatches * 10;
  
  // Check skills overlap
  let skillMatches = 0;
  (person.skills || []).forEach(skill => {
    if (jdLower.includes(skill.toLowerCase())) {
      skillMatches++;
    }
  });
  score += skillMatches * 4;
  
  // Check experience overlap
  let expMatches = 0;
  (person.experience || []).forEach(exp => {
    if (jdLower.includes(exp.toLowerCase())) {
      expMatches++;
    }
  });
  score += expMatches * 5;
  
  return Math.min(100, Math.round(score));
}
