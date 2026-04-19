'use client';
import { useState } from 'react';
import { useHistory } from '@/lib/store';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Review() {
  const history = useHistory();
  const [expanded, setExp] = useState(null);

  if (history.length === 0) return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="glass" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>No History</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Complete a mock test to review answers.</p>
      </div>
    </div>
  );

  return (
    <div className="container anim" style={{ marginTop: '1rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test Review</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.125rem', marginBottom: '2rem' }}>Review past tests, explanations, and mistakes.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map(test => (
          <div key={test.id} className="glass" style={{ overflow: 'hidden' }}>
            <div onClick={() => setExp(expanded === test.id ? null : test.id)} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: `1px solid ${test.scorePercent >= 80 ? 'var(--ok)' : test.scorePercent >= 50 ? 'var(--warn)' : 'var(--err)'}`, color: test.scorePercent >= 80 ? 'var(--ok)' : test.scorePercent >= 50 ? 'var(--warn)' : 'var(--err)', background: test.scorePercent >= 80 ? 'rgba(16,185,129,0.1)' : test.scorePercent >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {test.scorePercent}%
                </div>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{test.topicName}</h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {new Date(test.date).toLocaleDateString()} • {test.majorTopic} • {test.difficulty}
                  </div>
                </div>
              </div>
              {expanded === test.id ? <ChevronDown /> : <ChevronRight />}
            </div>

            {expanded === test.id && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {test.questions.map((q, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ paddingTop: '4px' }}>
                          {q.userAnswer === q.correctAnswer ? <CheckCircle2 color="var(--ok)" /> : <XCircle color="var(--err)" />}
                        </div>
                        <div>
                          <p style={{ fontWeight: '500', marginBottom: '0.75rem' }}>{idx + 1}. {q.text}</p>
                          <div style={{ fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--muted)', width: '100px' }}>Your Answer:</span>
                              <span style={{ fontWeight: '600', color: q.userAnswer === q.correctAnswer ? 'var(--ok)' : 'var(--err)' }}>{q.userAnswer || 'Skipped'}</span>
                            </div>
                            {q.userAnswer !== q.correctAnswer && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ color: 'var(--muted)', width: '100px' }}>Correct:</span>
                                <span style={{ fontWeight: '600', color: 'var(--ok)' }}>{q.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Explanation</span>
                        <p style={{ fontSize: '0.875rem' }}>{q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
