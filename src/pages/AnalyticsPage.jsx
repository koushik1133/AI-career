import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import {
  Briefcase, Target, TrendingUp, Award,
  Zap, BarChart3, Flame, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

export default function AnalyticsPage() {
  const { jobs, getAnalytics } = useData();
  const { theme } = useTheme();
  const analytics = useMemo(() => getAnalytics(), [jobs]);

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = theme === 'dark' ? '#a0a0b8' : '#5a5a7a';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff',
        titleColor: theme === 'dark' ? '#f0f0f5' : '#1a1a2e',
        bodyColor: textColor,
        borderColor: theme === 'dark' ? '#2a2a42' : '#e2e4ea',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11 } }
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11 } },
        beginAtZero: true
      }
    }
  };

  // Line chart - Applications over time
  const lineData = {
    labels: analytics.last30Days.map(d => {
      const date = new Date(d.date);
      return date.getDate() + '/' + (date.getMonth() + 1);
    }),
    datasets: [{
      label: 'Applications',
      data: analytics.last30Days.map(d => d.count),
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129, 140, 248, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2,
    }]
  };

  // Bar chart - Status distribution
  const statusLabels = Object.keys(analytics.statusDist);
  const statusColors = [
    '#6b6b82', '#60a5fa', '#a78bfa', '#fbbf24',
    '#fbbf24', '#fbbf24', '#34d399', '#f87171'
  ];

  const barData = {
    labels: statusLabels.map(s => s.length > 12 ? s.slice(0, 12) + '…' : s),
    datasets: [{
      label: 'Jobs',
      data: statusLabels.map(s => analytics.statusDist[s]),
      backgroundColor: statusColors.map(c => c + '33'),
      borderColor: statusColors,
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  // Doughnut chart - Pipeline
  const pipelineData = {
    labels: ['Not Applied', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
    datasets: [{
      data: [
        analytics.statusDist['Not Applied'] || 0,
        analytics.statusDist['Applied'] || 0,
        (analytics.statusDist['Online Assessment'] || 0) +
        (analytics.statusDist['Recruiter Interview'] || 0) +
        (analytics.statusDist['Technical Interview'] || 0) +
        (analytics.statusDist['Final Round'] || 0),
        analytics.statusDist['Offer'] || 0,
        analytics.statusDist['Rejected'] || 0,
      ],
      backgroundColor: [
        'rgba(107, 107, 130, 0.7)',
        'rgba(96, 165, 250, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(52, 211, 153, 0.7)',
        'rgba(248, 113, 113, 0.7)',
      ],
      borderColor: ['#6b6b82', '#60a5fa', '#fbbf24', '#34d399', '#f87171'],
      borderWidth: 2,
    }]
  };

  // Funnel data
  const funnelStages = [
    { label: 'Total Jobs', count: analytics.totalJobs, color: '#818cf8' },
    { label: 'Applied', count: analytics.totalApplied, color: '#60a5fa' },
    { label: 'Interviewing', count: analytics.totalInterviews, color: '#fbbf24' },
    { label: 'Offers', count: analytics.totalOffers, color: '#34d399' },
  ];
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1);

  // Insights
  const insights = [];
  if (analytics.avgATS > 0) {
    if (analytics.avgATS >= 75) {
      insights.push({ icon: <Award size={20} />, title: 'Strong ATS Scores', text: `Your average ATS score is ${analytics.avgATS}. Great resume optimization!`, type: 'success' });
    } else {
      insights.push({ icon: <Target size={20} />, title: 'Improve ATS Scores', text: `Your average ATS score is ${analytics.avgATS}. Aim for 75+ for better results.`, type: 'warning' });
    }
  }
  if (analytics.thisWeek > analytics.lastWeek) {
    insights.push({ icon: <TrendingUp size={20} />, title: 'Application Momentum', text: `You applied to ${analytics.thisWeek} jobs this week, up from ${analytics.lastWeek} last week!`, type: 'success' });
  } else if (analytics.thisWeek < analytics.lastWeek && analytics.lastWeek > 0) {
    insights.push({ icon: <Zap size={20} />, title: 'Keep Going', text: `Applications are down this week (${analytics.thisWeek} vs ${analytics.lastWeek}). Stay consistent!`, type: 'info' });
  }
  if (analytics.appliedToInterview > 0) {
    insights.push({ icon: <BarChart3 size={20} />, title: 'Conversion Rate', text: `${analytics.appliedToInterview}% of applications led to interviews. ${analytics.appliedToInterview >= 20 ? 'Excellent rate!' : 'Try tailoring resumes more.'}`, type: analytics.appliedToInterview >= 20 ? 'success' : 'info' });
  }
  if (analytics.streak > 0) {
    insights.push({ icon: <Flame size={20} />, title: `${analytics.streak}-Day Streak!`, text: `You've been active for ${analytics.streak} consecutive day${analytics.streak > 1 ? 's' : ''}. Keep the momentum going!`, type: 'success' });
  }
  if (insights.length === 0) {
    insights.push({ icon: <Zap size={20} />, title: 'Get Started', text: 'Analyze your first resume and start tracking jobs to see insights here.', type: 'info' });
  }

  const weekChange = analytics.lastWeek > 0
    ? Math.round(((analytics.thisWeek - analytics.lastWeek) / analytics.lastWeek) * 100)
    : analytics.thisWeek > 0 ? 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-description">
              Track your progress, analyze trends, and get AI-powered insights to improve your job search.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><Briefcase size={22} /></div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalJobs}</div>
            <div className="stat-label">Total Jobs Tracked</div>
            {weekChange !== 0 && (
              <div className={`stat-change ${weekChange > 0 ? 'positive' : 'negative'}`}>
                {weekChange > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(weekChange)}% this week
              </div>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Target size={22} /></div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalApplied}</div>
            <div className="stat-label">Applications Sent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><TrendingUp size={22} /></div>
          <div className="stat-content">
            <div className="stat-value">{analytics.avgATS || '—'}</div>
            <div className="stat-label">Avg. ATS Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Award size={22} /></div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalOffers}</div>
            <div className="stat-label">Offers Received</div>
          </div>
        </div>
      </div>

      {/* Streak + Conversion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
        <div className="streak-card">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="streak-value">{analytics.streak}</div>
            <div className="streak-label">Day Streak 🔥</div>
            <div className="streak-days">
              {analytics.weekDays.map((d, i) => (
                <div key={i} className={`streak-day ${d.active ? 'active' : ''}`}>
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Conversion Rates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Applied → Interview</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{analytics.appliedToInterview}%</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${analytics.appliedToInterview >= 20 ? 'excellent' : analytics.appliedToInterview >= 10 ? 'good' : 'average'}`}
                  style={{ width: `${analytics.appliedToInterview}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Interview → Offer</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{analytics.interviewToOffer}%</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${analytics.interviewToOffer >= 30 ? 'excellent' : analytics.interviewToOffer >= 15 ? 'good' : 'average'}`}
                  style={{ width: `${analytics.interviewToOffer}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Avg Match Score</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{analytics.avgMatch}%</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${analytics.avgMatch >= 70 ? 'excellent' : analytics.avgMatch >= 50 ? 'good' : 'average'}`}
                  style={{ width: `${analytics.avgMatch}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Applications Over Time</h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Last 30 days</span>
          </div>
          <div className="chart-container">
            <Line data={lineData} options={commonOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Status Distribution</h3>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={{
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                x: { ...commonOptions.scales.x, ticks: { ...commonOptions.scales.x.ticks, maxRotation: 45 } }
              }
            }} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Hiring Pipeline</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
            <div style={{ width: '220px', height: '220px' }}>
              <Doughnut data={pipelineData} options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 }
                  },
                  tooltip: commonOptions.plugins.tooltip
                }
              }} />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Hiring Funnel</h3>
          </div>
          <div className="funnel-chart" style={{ height: '280px', justifyContent: 'center' }}>
            {funnelStages.map((stage, i) => (
              <div key={i} className="funnel-stage">
                <span className="funnel-label">{stage.label}</span>
                <div className="funnel-bar" style={{
                  width: `${Math.max(15, (stage.count / maxFunnel) * 100)}%`,
                  background: stage.color,
                }}>
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
          AI Insights
        </h3>
        <div className="insights-grid">
          {insights.map((insight, i) => (
            <div key={i} className="insight-card">
              <div className="insight-icon">
                {insight.icon}
              </div>
              <div className="insight-content">
                <div className="insight-title">{insight.title}</div>
                <div className="insight-text">{insight.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
