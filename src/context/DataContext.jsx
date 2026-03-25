import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user ? `careerai-data-${user.id}` : null;

  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [activities, setActivities] = useState([]);

  // Load data on user change
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        setJobs(data.jobs || []);
        setResumes(data.resumes || []);
        setActivities(data.activities || []);
      } else {
        setJobs([]);
        setResumes([]);
        setActivities([]);
      }
    }
  }, [storageKey]);

  // Save data on change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ jobs, resumes, activities }));
    }
  }, [jobs, resumes, activities, storageKey]);

  const addJob = (job) => {
    const newJob = {
      id: Date.now().toString(),
      ...job,
      createdAt: new Date().toISOString(),
      status: job.status || 'Not Applied'
    };
    setJobs(prev => [newJob, ...prev]);
    addActivity('job_added', `Added ${job.company} - ${job.jobTitle}`);
    return newJob;
  };

  const updateJob = (id, updates) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    if (updates.status) {
      const job = jobs.find(j => j.id === id);
      if (job) addActivity('status_update', `${job.company}: ${updates.status}`);
    }
  };

  const deleteJob = (id) => {
    const job = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    if (job) addActivity('job_deleted', `Removed ${job.company} - ${job.jobTitle}`);
  };

  const addResume = (resume) => {
    const newResume = {
      id: Date.now().toString(),
      ...resume,
      createdAt: new Date().toISOString()
    };
    setResumes(prev => [newResume, ...prev]);
    addActivity('resume_created', `Resume for ${resume.company || 'General'}`);
    return newResume;
  };

  const addActivity = (type, description) => {
    setActivities(prev => [{
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 200));
  };

  // Analytics computed data
  const getAnalytics = () => {
    const totalJobs = jobs.length;
    const appliedJobs = jobs.filter(j => j.status !== 'Not Applied');
    const interviews = jobs.filter(j => ['Recruiter Interview', 'Technical Interview', 'Final Round'].includes(j.status));
    const offers = jobs.filter(j => j.status === 'Offer');
    const rejected = jobs.filter(j => j.status === 'Rejected');

    const avgATS = appliedJobs.length > 0
      ? Math.round(appliedJobs.reduce((sum, j) => sum + (j.atsScore || 0), 0) / appliedJobs.length)
      : 0;

    const avgMatch = appliedJobs.length > 0
      ? Math.round(appliedJobs.reduce((sum, j) => sum + (j.matchScore || 0), 0) / appliedJobs.length)
      : 0;

    const appliedToInterview = appliedJobs.length > 0
      ? Math.round((interviews.length / appliedJobs.length) * 100)
      : 0;

    const interviewToOffer = interviews.length > 0
      ? Math.round((offers.length / interviews.length) * 100)
      : 0;

    // Applications over time (last 30 days)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = jobs.filter(j => {
        const jDate = (j.dateApplied || j.createdAt || '').split('T')[0];
        return jDate === dateStr;
      }).length;
      last30Days.push({ date: dateStr, count });
    }

    // Status distribution
    const statusDist = {};
    const statuses = ['Not Applied', 'Applied', 'Online Assessment', 'Recruiter Interview', 'Technical Interview', 'Final Round', 'Offer', 'Rejected'];
    statuses.forEach(s => {
      statusDist[s] = jobs.filter(j => j.status === s).length;
    });

    // Weekly applications
    const thisWeek = jobs.filter(j => {
      const d = new Date(j.createdAt);
      const now = new Date();
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    const lastWeek = jobs.filter(j => {
      const d = new Date(j.createdAt);
      const now = new Date();
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    }).length;

    // Streak calculation
    const activityDates = new Set(
      activities.map(a => a.timestamp.split('T')[0])
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (activityDates.has(ds)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Last 7 days streak
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      weekDays.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        active: activityDates.has(ds)
      });
    }

    return {
      totalJobs,
      totalApplied: appliedJobs.length,
      totalInterviews: interviews.length,
      totalOffers: offers.length,
      totalRejected: rejected.length,
      avgATS,
      avgMatch,
      appliedToInterview,
      interviewToOffer,
      last30Days,
      statusDist,
      thisWeek,
      lastWeek,
      streak,
      weekDays,
      totalResumes: resumes.length
    };
  };

  return (
    <DataContext.Provider value={{
      jobs, resumes, activities,
      addJob, updateJob, deleteJob,
      addResume, addActivity,
      getAnalytics
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
