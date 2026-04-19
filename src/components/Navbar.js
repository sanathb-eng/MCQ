'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, PieChart, Clock, BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Topic Map', path: '/', icon: BookOpen },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Review', path: '/review', icon: Clock },
  ];

  return (
    <nav style={{
      background: 'rgba(10, 15, 30, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit color="var(--accent)" size={28} />
          <span style={{
            fontWeight: 'bold', fontSize: '1.25rem',
            background: 'var(--grad)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CorpLaw Master
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500',
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingBottom: '4px', transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
}
