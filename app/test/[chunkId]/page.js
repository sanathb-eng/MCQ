'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addTestResult } from '../../../lib/store';
import { ArrowLeft, Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TestEngine({ params }) {
  const router = useRouter();
  const chunkId = params.chunkId;
  
  const [chunkData, setChunkData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [testState, setTestState] = useState('config'); // config, running, results
  const [config, setConfig] = useState({ count: 5, difficulty: 'Medium' });
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  // Load the chunk data
  useEffect(() => {
    fetch(`/data/chunks/${chunkId}.json`)
      .then(res => res.json())
      .then(data => setChunkData(data))
      .catch(err => setError('Failed to load topic data.'));
  }, [chunkId]);

  const generateQuestions = async () => {
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
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }
      
      setQuestions(data.questions);
      setTestState('running');
      setCurrentQIndex(0);
      setAnswers({});
      setIsAnswerRevealed(false);
      
    } catch (err) {
      console.error(err);
      setError('Error processing output. Please try again. Raw error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (key) => {
    if (isAnswerRevealed) return;
    setAnswers({ ...answers, [currentQIndex]: key });
  };

  const submitAnswer = () => {
    if (!answers[currentQIndex]) return;
    setIsAnswerRevealed(true);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setIsAnswerRevealed(false);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    // Calculate score
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    const percent = Math.round((correct / questions.length) * 100);
    
    // Save to history
    addTestResult({
      chunkId,
      topicName: chunkData.title,
      majorTopic: chunkData.topic,
      scorePercent: percent,
      correctCount: correct,
      totalCount: questions.length,
      difficulty: config.difficulty,
      questions: questions.map((q, i) => ({
        text: q.text,
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
    });
    
    setTestState('results');
  };

  if (!chunkData) {
    return <div className="container mt-8 text-center text-muted"><Loader2 className="animate-spin inline mr-2" /> Loading topic...</div>;
  }

  return (
    <div className="container mt-4 animate-fade-in">
      <div className="mb-6">
        <Link href="/" className="text-muted flex items-center gap-2 hover:text-white transition-colors w-fit">
          <ArrowLeft size={18} /> Back to Topic Map
        </Link>
      </div>

      {/* CONFIG STATE */}
      {testState === 'config' && (
        <div className="glass-panel p-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="status-badge badge-mastered inline-block mb-3">{chunkData.topic}</div>
            <h1 className="text-3xl font-bold mb-2">{chunkData.title}</h1>
            <p className="text-muted">Configure your mock test for this topic. The AI will generate fresh questions from the course material based on your settings.</p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Number of Questions</label>
            <div className="flex gap-4">
              {[5, 10, 15].map(n => (
                <button 
                  key={n}
                  onClick={() => setConfig({...config, count: n})}
                  className={`flex-1 py-3 border rounded-lg transition-all ${config.count === n ? 'border-accent bg-[rgba(99,102,241,0.1)]' : 'border-[var(--panel-border)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                  style={config.count === n ? { borderColor: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' } : {}}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block mb-2 font-medium">Difficulty Level</label>
            <div className="flex gap-4">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button 
                  key={d}
                  onClick={() => setConfig({...config, difficulty: d})}
                  className={`flex-1 py-3 border rounded-lg transition-all ${config.difficulty === d ? 'border-accent bg-[rgba(99,102,241,0.1)]' : 'border-[var(--panel-border)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                  style={config.difficulty === d ? { borderColor: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)' } : {}}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-6 p-4 rounded-lg bg-[rgba(239,68,68,0.1)] text-danger border border-danger">{error}</div>}

          <button 
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading ? <><Loader2 className="animate-spin" /> Generating from Knowledge Base...</> : <><PlayCircle /> Start Test</>}
          </button>
        </div>
      )}

      {/* RUNNING STATE */}
      {testState === 'running' && questions.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{chunkData.title}</h2>
            <div className="px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[var(--panel-border)] rounded-full text-sm font-medium">
              Question {currentQIndex + 1} of {questions.length}
            </div>
          </div>

          <div className="progress-bar-bg mb-8">
            <div className="progress-bar-fill" style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}></div>
          </div>

          <div className="glass-panel p-8 mb-6">
            <p className="text-xl mb-8 leading-relaxed whitespace-pre-wrap">{questions[currentQIndex].text}</p>
            
            <div className="flex flex-col">
              {['A', 'B', 'C', 'D'].map(optionKey => {
                const isSelected = answers[currentQIndex] === optionKey;
                const isCorrect = isAnswerRevealed && questions[currentQIndex].correctAnswer === optionKey;
                const isWrongSelection = isAnswerRevealed && isSelected && !isCorrect;
                
                let btnClass = "option-btn";
                if (isSelected && !isAnswerRevealed) btnClass += " selected";
                if (isCorrect) btnClass += " correct";
                if (isWrongSelection) btnClass += " incorrect";

                return (
                  <button 
                    key={optionKey}
                    className={btnClass}
                    onClick={() => handleSelectOption(optionKey)}
                    disabled={isAnswerRevealed}
                  >
                    <span className="letter-badge">{optionKey}</span>
                    <span className="text-left w-full">{questions[currentQIndex].options[optionKey]}</span>
                    {isCorrect && <CheckCircle2 className="ml-auto text-success" />}
                    {isWrongSelection && <XCircle className="ml-auto text-danger" />}
                  </button>
                )
              })}
            </div>
          </div>

          {isAnswerRevealed && (
            <div className="glass-panel p-6 mb-6 border-l-4 animate-fade-in" style={{ borderLeftColor: answers[currentQIndex] === questions[currentQIndex].correctAnswer ? 'var(--success)' : 'var(--danger)' }}>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                {answers[currentQIndex] === questions[currentQIndex].correctAnswer 
                  ? <span className="text-success flex items-center gap-2"><CheckCircle2 size={18}/> Correct</span> 
                  : <span className="text-danger flex items-center gap-2"><XCircle size={18}/> Incorrect</span>
                }
              </h4>
              <p className="text-muted leading-relaxed">{questions[currentQIndex].explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!isAnswerRevealed ? (
              <button 
                className="btn-primary px-8 py-3"
                onClick={submitAnswer}
                disabled={!answers[currentQIndex]}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                className="btn-primary px-8 py-3"
                onClick={handleNext}
              >
                {currentQIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS STATE */}
      {testState === 'results' && (
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <div className="glass-panel p-10 mb-8">
            <h1 className="text-4xl font-bold mb-2">Test Complete</h1>
            <p className="text-muted mb-8">{chunkData.title}</p>
            
            <div className="flex justify-center items-center mb-8">
              <div 
                className="relative flex items-center justify-center w-48 h-48 rounded-full border-8"
                style={{
                  borderColor: (() => {
                    const score = (questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length) * 100;
                    if (score >= 80) return 'var(--success)';
                    if (score >= 50) return 'var(--warning)';
                    return 'var(--danger)';
                  })(),
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
              >
                <div className="text-center">
                  <div className="text-5xl font-bold mb-1">
                    {Math.round((questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted">
                    {questions.filter((q, i) => answers[i] === q.correctAnswer).length} of {questions.length} correct
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[var(--panel-border)] mb-8">
              <h3 className="font-bold text-lg mb-2">Smart Recommendation</h3>
              {(() => {
                const score = (questions.filter((q, i) => answers[i] === q.correctAnswer).length / questions.length) * 100;
                if (score >= 80) {
                  return <p className="text-success">Excellent work! You have mastered this topic. Move on to the next one.</p>;
                } else if (score >= 50) {
                  return <p className="text-warning">Good effort, but there is room for improvement. Retry this topic to solidify your understanding.</p>;
                } else {
                  return <p className="text-danger">You struggled with this topic. Please review the course materials before attempting another test.</p>;
                }
              })()}
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                className="btn-secondary"
                onClick={() => { setTestState('config'); setQuestions([]); }}
              >
                Retry Topic
              </button>
              <Link href="/" className="btn-primary">
                Return to Topic Map
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
