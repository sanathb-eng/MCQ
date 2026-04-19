import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Corporate Law II - Exam Prep',
  description: 'AI-powered mock test engine and study companion for Corporate Law II',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ paddingBottom: '4rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
