import TopicMap from '../components/TopicMap';
import fs from 'fs/promises';
import path from 'path';

export default async function Home() {
  // Read the topic index on the server side
  const filePath = path.join(process.cwd(), 'public', 'data', 'topic_index.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const topicData = JSON.parse(fileContents);

  return (
    <div className="container mt-4 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topic Map</h1>
        <p className="text-muted text-lg">Select a specific topic carefully bounded for optimal AI context to start a mock test.</p>
      </div>
      <TopicMap data={topicData} />
    </div>
  );
}
