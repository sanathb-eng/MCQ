'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, PieChart, Clock, Settings, BrainCircuit } from 'lucide-react';

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
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="text-accent" size={28} />
          <span className="font-bold text-xl" style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CorpLaw Master
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="flex items-center gap-2 font-medium"
                style={{ 
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  paddingBottom: '4px'
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
