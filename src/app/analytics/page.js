'use client';
import { useHistory } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Analytics() {
  const history = useHistory();

  if (history.length === 0) return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="glass" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>No Data Yet</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Take your first mock test to see your performance analytics.</p>
        <a href="/" className="btn-p">Go to Topic Map</a>
      </div>
    </div>
  );

  const tq = history.reduce((a, t) => a + t.totalCount, 0);
  const tc = history.reduce((a, t) => a + t.correctCount, 0);
  const acc = Math.round((tc / tq) * 100);

  const scoreData = [...history].reverse().map((t, i) => ({ name: `T${i+1}`, score: t.scorePercent, topic: t.topicName }));

  const topics = ['IBC', 'Competition Law', 'FEMA & Foreign Investment', 'Companies Act'];
  const topicData = topics.map(topic => {
    const ts = history.filter(t => t.majorTopic === topic);
    const qCount = ts.reduce((a, t) => a + t.totalCount, 0);
    const score = qCount > 0 ? Math.round((ts.reduce((a, t) => a + t.correctCount, 0) / qCount) * 100) : 0;
    return { name: topic.replace(' & ', ' &\n'), score, attempts: qCount };
  }).filter(t => t.attempts > 0);

  return (
    <div className="container anim" style={{ marginTop: '1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Analytics</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.125rem', marginBottom: '2rem' }}>Track your mastery across Corporate Law II topics.</p>

      <div className="g4" style={{ marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '4px' }}>Accuracy</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: acc >= 80 ? 'var(--ok)' : acc >= 50 ? 'var(--warn)' : 'var(--err)' }}>{acc}%</div>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '4px' }}>Tests Taken</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{history.length}</div>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '4px' }}>Questions</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{tq}</div>
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '4px' }}>Mastered Topics</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--ok)' }}>{new Set(history.filter(h => h.scorePercent >= 80).map(h => h.chunkId)).size}</div>
        </div>
      </div>

      <div className="g2">
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>Performance Trend</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={scoreData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent2)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>Accuracy by Subject</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)"/>
                <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.7)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {topicData.map((e, i) => <Cell key={i} fill={e.score >= 80 ? 'var(--ok)' : e.score >= 50 ? 'var(--warn)' : 'var(--err)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
