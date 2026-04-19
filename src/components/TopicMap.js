'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useHistory } from '@/lib/store';
import { PlayCircle, CheckCircle2, Circle } from 'lucide-react';

export default function TopicMap({ data }) {
  const history = useHistory();
  const [expanded, setExpanded] = useState('IBC');

  const getStatus = (chunkId) => {
    const attempts = history.filter(h => h.chunkId === chunkId);
    if (!attempts.length) return { status: 'not-started', score: 0 };
    const max = Math.max(...attempts.map(a => a.scorePercent));
    return { status: max >= 80 ? 'ok' : 'attempted', score: max };
  };

  const grouped = data.metadata.topic_names.map(name => {
    const chunks = data.topic_sequence.filter(c => c.topic === name);
    let completed = 0;
    chunks.forEach(c => { if (getStatus(c.id).status === 'ok') completed++; });
    const progress = Math.round((completed / chunks.length) * 100) || 0;
    return { name, chunks, progress };
  });

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Sidebar */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {grouped.map(g => {
          const isExp = expanded === g.name;
          return (
            <div 
              key={g.name}
              className="glass"
              onClick={() => setExpanded(g.name)}
              style={{
                padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s',
                borderColor: isExp ? 'var(--accent)' : 'var(--border)',
                boxShadow: isExp ? '0 0 20px rgba(99,102,241,0.2)' : undefined
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{g.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                <span>Progress</span>
                <span>{g.progress}%</span>
              </div>
              <div className="pb-bg"><div className="pb-fill" style={{ width: `${g.progress}%` }}></div></div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>{g.chunks.length} Topics</div>
            </div>
          );
        })}
      </div>

      {/* Main chunks */}
      <div style={{ flex: '2 1 500px' }}>
        {grouped.find(g => g.name === expanded)?.chunks.map((chunk, idx) => {
          const { status, score } = getStatus(chunk.id);
          return (
            <div key={chunk.id} className="glass" style={{ padding: '1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{(idx + 1).toString().padStart(2, '0')}</span>
                  <h4 style={{ fontWeight: '600', fontSize: '1.125rem' }}>{chunk.title}</h4>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', display: 'flex', gap: '1rem' }}>
                  <span>~{chunk.approx_tokens.toLocaleString()} tokens</span>
                  <span>{chunk.cases.length} cases</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {status === 'ok' && <div style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}><CheckCircle2 size={18}/> {score}%</div>}
                {status === 'attempted' && <div style={{ color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}><Circle size={18}/> {score}%</div>}
                {status === 'not-started' && <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Not started</div>}
                
                <Link href={`/test/${chunk.id}`} className="btn-p">
                  <PlayCircle size={18} /> {status === 'not-started' ? 'Start' : 'Retry'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
