'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTestHistory } from '../lib/store';
import { PlayCircle, CheckCircle2, Circle } from 'lucide-react';

export default function TopicMap({ data }) {
  const history = useTestHistory();
  const [expandedTopic, setExpandedTopic] = useState('IBC');

  // Helper to determine status and high score of a chunk
  const getChunkStatus = (chunkId) => {
    const attempts = history.filter(h => h.chunkId === chunkId);
    if (attempts.length === 0) return { status: 'not-started', score: 0 };
    
    const maxScore = Math.max(...attempts.map(a => a.scorePercent));
    if (maxScore >= 80) return { status: 'mastered', score: maxScore };
    return { status: 'attempted', score: maxScore };
  };

  // Group chunks by major topic
  const grouped = data.metadata.topic_names.map(topicName => {
    const chunks = data.topic_sequence.filter(c => c.topic === topicName);
    
    // Calculate overall progress
    let totalScore = 0;
    let completedChunks = 0;
    chunks.forEach(c => {
      const { status, score } = getChunkStatus(c.id);
      totalScore += score;
      if (status === 'mastered') completedChunks++;
    });
    
    const progress = Math.round((completedChunks / chunks.length) * 100) || 0;

    return {
      name: topicName,
      chunks,
      progress
    };
  });

  return (
    <div className="flex gap-6 flex-col md:flex-row">
      {/* Sidebar: Major Topics */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {grouped.map(group => (
          <div 
            key={group.name}
            className={`glass-panel p-6 cursor-pointer transition-all ${expandedTopic === group.name ? 'border-accent' : ''}`}
            onClick={() => setExpandedTopic(group.name)}
            style={expandedTopic === group.name ? { borderColor: 'var(--accent-primary)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' } : {}}
          >
            <h3 className="text-xl font-bold mb-4">{group.name}</h3>
            <div className="flex justify-between text-sm text-muted mb-2">
              <span>Progress</span>
              <span>{group.progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${group.progress}%` }}></div>
            </div>
            <div className="mt-4 text-sm text-muted">
              {group.chunks.length} Topics
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Chunks in selected topic */}
      <div className="w-full md:w-2/3">
        {grouped.find(g => g.name === expandedTopic)?.chunks.map((chunk, index) => {
          const { status, score } = getChunkStatus(chunk.id);
          
          return (
            <div key={chunk.id} className="glass-panel p-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-accent font-bold">{(index + 1).toString().padStart(2, '0')}</span>
                  <h4 className="font-semibold text-lg">{chunk.title}</h4>
                </div>
                <div className="text-sm text-muted flex gap-4">
                  <span>~{chunk.approx_tokens.toLocaleString()} tokens</span>
                  <span>{chunk.cases.length} cases</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {status === 'mastered' && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold">{score}%</span>
                  </div>
                )}
                {status === 'attempted' && (
                  <div className="flex items-center gap-2 text-warning">
                    <Circle size={18} />
                    <span className="text-sm font-bold">{score}%</span>
                  </div>
                )}
                {status === 'not-started' && (
                  <div className="flex items-center gap-2 text-muted">
                    <span className="text-sm">Not started</span>
                  </div>
                )}
                
                <Link href={`/test/${chunk.id}`} className="btn-primary flex items-center gap-2" style={{marginLeft: 'auto'}}>
                  <PlayCircle size={18} />
                  {status === 'not-started' ? 'Start' : 'Retry'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
