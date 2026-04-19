'use client';

import { useTestHistory } from '../../lib/store';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';

export default function Analytics() {
  const history = useTestHistory();

  if (history.length === 0) {
    return (
      <div className="container mt-8 text-center">
        <div className="glass-panel p-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">No Data Yet</h2>
          <p className="text-muted mb-6">Take your first mock test to see performance analytics.</p>
          <a href="/" className="btn-primary inline-flex">Go to Topic Map</a>
        </div>
      </div>
    );
  }

  // Calculate overall metrics
  const totalTests = history.length;
  const totalQuestions = history.reduce((acc, test) => acc + test.totalCount, 0);
  const totalCorrect = history.reduce((acc, test) => acc + test.correctCount, 0);
  const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100);

  // Line chart data (Score over time, ascending order)
  const scoreData = [...history].reverse().map((t, idx) => ({
    name: `Test ${idx + 1}`,
    score: t.scorePercent,
    topic: t.majorTopic
  }));

  // Bar chart data (Accuracy by Major Topic)
  const topics = ['IBC', 'Competition Law', 'FEMA & Foreign Investment', 'Companies Act'];
  const topicData = topics.map(topic => {
    const topicTests = history.filter(t => t.majorTopic === topic);
    const qCount = topicTests.reduce((acc, t) => acc + t.totalCount, 0);
    const cCount = topicTests.reduce((acc, t) => acc + t.correctCount, 0);
    const score = qCount > 0 ? Math.round((cCount / qCount) * 100) : 0;
    return { name: topic.replace(' & ', ' & \n'), score, attempts: qCount };
  }).filter(t => t.attempts > 0);

  // Difficulty pie chart
  const difficultyCounts = history.reduce((acc, t) => {
    acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
    return acc;
  }, {});
  const diffData = Object.keys(difficultyCounts).map(key => ({
    name: key, value: difficultyCounts[key]
  }));
  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy, Med, Hard roughly

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 text-sm" style={{ backgroundColor: 'rgba(10, 15, 30, 0.9)' }}>
          <p className="font-bold mb-1">{label}</p>
          <p className="text-accent">{`Score: ${payload[0].value}%`}</p>
          {payload[0].payload.topic && <p className="text-muted mt-1 text-xs">{payload[0].payload.topic}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mt-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted text-lg">Track your mastery across Corporate Law II topics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4 mb-8">
        <div className="glass-panel p-6">
          <div className="text-sm text-muted mb-1">Overall Accuracy</div>
          <div className="text-4xl font-bold" style={{ color: overallAccuracy >= 80 ? 'var(--success)' : overallAccuracy >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {overallAccuracy}%
          </div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-muted mb-1">Tests Taken</div>
          <div className="text-4xl font-bold">{totalTests}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-muted mb-1">Questions Answered</div>
          <div className="text-4xl font-bold">{totalQuestions}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-muted mb-1">Mastered Topics</div>
          <div className="text-4xl font-bold text-success">
            {new Set(history.filter(h => h.scorePercent >= 80).map(h => h.chunkId)).size}
          </div>
        </div>
      </div>

      <div className="grid-cols-2 mb-8">
        {/* Performance Trend */}
        <div className="glass-panel p-6">
          <h3 className="font-bold mb-6 text-lg">Performance Trend</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={scoreData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="url(#colorUv)" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 8 }} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="glass-panel p-6">
          <h3 className="font-bold mb-6 text-lg">Accuracy by Subject</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topicData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)"/>
                <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="name" type="category" width={120} stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
