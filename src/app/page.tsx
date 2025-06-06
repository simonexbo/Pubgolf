'use client';

import { useGame } from '@/context/GameContext';
import PageAdmin from '@/components/PageAdmin';
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

  return <PageAdmin />;
} 