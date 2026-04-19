import { notFound } from 'next/navigation';
import { chunkDataMap } from '@/data/chunkDataMap';
import TestEngineClient from '@/components/TestEngineClient';

export default async function TestPage({ params }) {
  const { chunkId } = await params;

  if (!chunkId || Array.isArray(chunkId)) {
    notFound();
  }

  const chunkData = chunkDataMap[chunkId];
  if (!chunkData) {
    notFound();
  }

  return <TestEngineClient chunkId={chunkId} initialChunkData={chunkData} />;
}
