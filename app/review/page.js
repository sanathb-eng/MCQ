'use client';

import { useState } from 'react';
import { useTestHistory } from '../../lib/store';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Review() {
  const history = useTestHistory();
  const [expandedTest, setExpandedTest] = useState(null);

  if (history.length === 0) {
    return (
      <div className="container mt-8 text-center">
        <div className="glass-panel p-10 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">No History</h2>
          <p className="text-muted mb-6">Complete a mock test to review your past answers here.</p>
        </div>
      </div>
    );
  }

  const toggleTest = (id) => {
    setExpandedTest(expandedTest === id ? null : id);
  };

  return (
    <div className="container mt-4 animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Review</h1>
        <p className="text-muted text-lg">Review your past tests, explanations, and mistakes.</p>
      </div>

      <div className="flex flex-col gap-4">
        {history.map((test) => (
          <div key={test.id} className="glass-panel overflow-hidden">
            <div 
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              onClick={() => toggleTest(test.id)}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    backgroundColor: test.scorePercent >= 80 ? 'rgba(16,185,129,0.1)' : test.scorePercent >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: test.scorePercent >= 80 ? 'var(--success)' : test.scorePercent >= 50 ? 'var(--warning)' : 'var(--danger)',
                    border: `1px solid ${test.scorePercent >= 80 ? 'var(--success)' : test.scorePercent >= 50 ? 'var(--warning)' : 'var(--danger)'}`
                  }}
                >
                  {test.scorePercent}%
                </div>
                <div>
                  <h3 className="font-bold text-lg">{test.topicName}</h3>
                  <div className="text-sm text-muted flex gap-3">
                    <span>{new Date(test.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{test.majorTopic}</span>
                    <span>•</span>
                    <span>{test.difficulty}</span>
                  </div>
                </div>
              </div>
              <div>
                {expandedTest === test.id ? <ChevronDown /> : <ChevronRight />}
              </div>
            </div>

            {expandedTest === test.id && (
              <div className="p-6 pt-0 border-t border-[var(--panel-border)] bg-[rgba(0,0,0,0.2)]">
                <div className="mt-6 flex flex-col gap-6">
                  {test.questions.map((q, idx) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-5">
                      <div className="flex gap-4 mb-4">
                        <div className="pt-1">
                          {q.userAnswer === q.correctAnswer ? 
                            <CheckCircle2 className="text-success" /> : 
                            <XCircle className="text-danger" />
                          }
                        </div>
                        <div>
                          <p className="font-medium mb-3">{idx + 1}. {q.text}</p>
                          <div className="text-sm grid gap-2">
                            <div className="flex gap-2">
                              <span className="text-muted w-24">Your Answer:</span>
                              <span className={q.userAnswer === q.correctAnswer ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                                {q.userAnswer || 'Not Answered'}
                              </span>
                            </div>
                            {q.userAnswer !== q.correctAnswer && (
                              <div className="flex gap-2">
                                <span className="text-muted w-24">Correct:</span>
                                <span className="text-success font-semibold">{q.correctAnswer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 rounded-lg bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.2)]">
                        <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1 block">Explanation</span>
                        <p className="text-sm leading-relaxed">{q.explanation}</p>
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
