'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { currentGame } = useGame();
  const router = useRouter();

  // Om spelet är aktivt, omdirigera till /game
  useEffect(() => {
    if (currentGame?.status === 'active') {
      router.push('/game');
    }
  }, [currentGame, router]);

  // Om spelet är aktivt, visa ingenting medan omdirigeringen sker
  if (currentGame?.status === 'active') {
    return null;
  }

  return (
    <main className="min-h-screen bg-iosgray-light flex items-center justify-center py-8">
      <div className="text-center px-4">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 tracking-tight">Pubgolf</h1>
        <p className="text-gray-600">Fråga arrangören om länken till ditt spel.</p>
      </div>
    </main>
  );
} 