'use client';

import { useState, useEffect } from 'react';

// Global state for test history
let testHistory = [];
const historyListeners = new Set();

export function useTestHistory() {
  const [history, setHistory] = useState(testHistory);

  useEffect(() => {
    if (typeof window !== 'undefined' && testHistory.length === 0) {
      const stored = localStorage.getItem('corp_law_test_history');
      if (stored) {
        testHistory = JSON.parse(stored);
        setHistory(testHistory);
      }
    }

    const listener = (h) => setHistory([...h]);
    historyListeners.add(listener);
    return () => historyListeners.delete(listener);
  }, []);

  return history;
}

export function addTestResult(result) {
  testHistory.unshift({
    ...result,
    id: Date.now().toString(),
    date: new Date().toISOString()
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('corp_law_test_history', JSON.stringify(testHistory));
  }
  historyListeners.forEach((l) => l(testHistory));
}
