import TopicMap from '@/components/TopicMap';
import topicData from '@/data/topic_index.json';

export default function Home() {
  return (
    <div className="container anim" style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Topic Map</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>
          Select a specific topic bounded for optimal AI context to start a dynamic mock test.
        </p>
      </div>
      <TopicMap data={topicData} />
    </div>
  );
}
