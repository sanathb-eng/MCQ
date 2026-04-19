'use client';
import { useState, useEffect, useCallback } from 'react';

// ── Test history persistence via localStorage ──
let cache = null;
const subs = new Set();

function load() {
  if (cache) return cache;
  if (typeof window === 'undefined') return [];
  try {
    cache = JSON.parse(localStorage.getItem('clm_history') || '[]');
  } catch { cache = []; }
  return cache;
}

function save(h) {
  cache = h;
  if (typeof window !== 'undefined') localStorage.setItem('clm_history', JSON.stringify(h));
  subs.forEach(fn => fn(h));
}

export function useHistory() {
  const [h, setH] = useState([]);
  useEffect(() => {
    setH(load());
    const fn = (v) => setH([...v]);
    subs.add(fn);
    return () => subs.delete(fn);
  }, []);
  return h;
}

export function addResult(result) {
  const h = load();
  h.unshift({ ...result, id: Date.now().toString(), date: new Date().toISOString() });
  save(h);
}
