'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { addResult } from '@/lib/store';
import { ArrowLeft, Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TestEngine() {
  const params = useParams();
  const chunkIdParam = params?.chunkId;
  const chunkId = Array.isArray(chunkIdParam) ? chunkIdParam[0] : chunkIdParam;
  
  const [chunkData, setChunkData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [mode, setMode] = useState('config'); // config, run, done
  const [config, setConfig] = useState({ count: 5, difficulty: 'Medium' });
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  
  useEffect(() => {
    if (!chunkId) return;

    let active = true;
    setError('');

    // Fetch directly from Vercel's static public Edge instead of fighting Webpack dynamic bundle behavior
    fetch(`/data/chunks/${encodeURIComponent(chunkId)}.json`)
      .then(res => {
        if (!res.ok) throw new Error('File not found');
        return res.json();
      })
      .then(data => {
        if (active) setChunkData(data);
      })
      .catch(() => {
        if (active) setError('Failed to load topic data. Refresh the page or go back.');
      });

    return () => {
      active = false;
    };
  }, [chunkId]);

  const generate = async () => {
    if (!chunkData) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunkData, config })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions');
      
      setQuestions(data.questions);
      setMode('run');
      setQIdx(0);
      setAnswers({});
      setRevealed(false);
    } catch (err) {
      console.error(err);
      setError('Generation failed. Ensure Vercel GEMINI_API_KEY is configured correctly: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishTest = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const p = Math.round((correct / questions.length) * 100);
    
    addResult({
      chunkId, topicName: chunkData.title, majorTopic: chunkData.topic,
      scorePercent: p, correctCount: correct, totalCount: questions.length, difficulty: config.difficulty,
      questions: questions.map((q, i) => ({
        text: q.text, userAnswer: answers[i], correctAnswer: q.correctAnswer, explanation: q.explanation
      }))
    });
    setMode('done');
  };

  if (error && !chunkData) return <div className="container" style={{marginTop:'2rem',textAlign:'center',color:'var(--err)'}}>{error}</div>;
  if (!chunkData) return <div className="container" style={{marginTop:'2rem',textAlign:'center',color:'var(--muted)'}}><Loader2 className="spin" size={24} style={{display:'inline',marginRight:'8px'}}/> Loading topic...</div>;

  return (
    <div className="container anim" style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> Back to Map
        </Link>
      </div>

      {mode === 'config' && (
        <div className="glass" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(16,185,129,0.2)', color: 'var(--ok)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
              {chunkData.topic}
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{chunkData.title}</h1>
            <p style={{ color: 'var(--muted)' }}>Select parameters to generate a mock test dynamically from this syllabus section.</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Number of Questions</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {[5, 10, 15].map(n => (
                <button key={n} onClick={() => setConfig({...config, count: n})} className="input-f" style={{ textAlign: 'center', borderColor: config.count === n ? 'var(--accent)' : 'var(--border)', background: config.count === n ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Difficulty</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setConfig({...config, difficulty: d})} className="input-f" style={{ textAlign: 'center', borderColor: config.difficulty === d ? 'var(--accent)' : 'var(--border)', background: config.difficulty === d ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--err)', border: '1px solid var(--err)', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

          <button className="btn-p" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.125rem' }} onClick={generate} disabled={loading}>
            {loading ? <><Loader2 className="spin" size={20} /> Generating with AI...</> : <><PlayCircle size={20} /> Start Mock Test</>}
          </button>
        </div>
      )}

      {mode === 'run' && questions.length > 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{chunkData.title}</h2>
            <div style={{ padding: '4px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
              {qIdx + 1} of {questions.length}
            </div>
          </div>

          <div className="pb-bg" style={{ marginBottom: '2rem' }}>
            <div className="pb-fill" style={{ width: `${(qIdx / questions.length) * 100}%` }}></div>
          </div>

          <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>{questions[qIdx].text}</p>
            <div>
              {['A', 'B', 'C', 'D'].map(k => {
                const isSel = answers[qIdx] === k;
                const isOK = revealed && questions[qIdx].correctAnswer === k;
                const isBad = revealed && isSel && !isOK;
                
                let cx = "opt";
                if (isSel && !revealed) cx += " sel";
                if (isOK) cx += " ok";
                if (isBad) cx += " bad";

                return (
                  <button key={k} className={cx} onClick={() => !revealed && setAnswers({...answers, [qIdx]: k})} disabled={revealed}>
                    <span className="lbadge">{k}</span>
                    <span style={{ flex: 1 }}>{questions[qIdx].options[k]}</span>
                    {isOK && <CheckCircle2 style={{ color: 'var(--ok)' }} />}
                    {isBad && <XCircle style={{ color: 'var(--err)' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {revealed && (
            <div className="glass anim" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: `4px solid ${answers[qIdx] === questions[qIdx].correctAnswer ? 'var(--ok)' : 'var(--err)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '8px', color: answers[qIdx] === questions[qIdx].correctAnswer ? 'var(--ok)' : 'var(--err)' }}>
                {answers[qIdx] === questions[qIdx].correctAnswer ? <><CheckCircle2 size={18}/> Correct</> : <><XCircle size={18}/> Incorrect</>}
              </div>
              <p style={{ color: 'var(--muted)' }}>{questions[qIdx].explanation}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {!revealed ? (
              <button className="btn-p" onClick={() => setRevealed(true)} disabled={!answers[qIdx]}>Submit Answer</button>
            ) : (
              <button className="btn-p" onClick={() => qIdx < questions.length - 1 ? (setQIdx(qIdx + 1), setRevealed(false)) : finishTest()}>
                {qIdx < questions.length - 1 ? 'Next Question' : 'Finish Test'}
              </button>
            )}
          </div>
        </div>
      )}

      {mode === 'done' && (
        <div className="anim" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="glass" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test Complete</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>{chunkData.title}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '180px', height: '180px', borderRadius: '50%', border: '8px solid',
                borderColor: (() => {
                  const s = questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length * 100;
                  return s >= 80 ? 'var(--ok)' : s >= 50 ? 'var(--warn)' : 'var(--err)';
                })(),
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1' }}>
                  {Math.round(questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length * 100)}%
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>
                  {questions.filter((q, i) => answers[i] === q.correctAnswer).length} / {questions.length} correct
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Smart Recommendation</h3>
              {(() => {
                const s = questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length * 100;
                if (s >= 80) return <p style={{ color: 'var(--ok)' }}>Excellent! You have mastered this. Move on.</p>;
                if (s >= 50) return <p style={{ color: 'var(--warn)' }}>Good effort. Retry this topic to solidify understanding.</p>;
                return <p style={{ color: 'var(--err)' }}>You struggled here. Review the materials first.</p>;
              })()}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-s" onClick={() => { setMode('config'); setQuestions([]); }}>Retry Topic</button>
              <Link href="/" className="btn-p">Return to Map</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
