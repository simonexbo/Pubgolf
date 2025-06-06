'use client';

import { useGame } from '@/context/GameContext';
import PageGame from '@/components/PageGame';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GamePage() {
  const { currentGame } = useGame();
  const router = useRouter();

  // Om spelet inte är aktivt, omdirigera till admin-sidan
  useEffect(() => {
    if (!currentGame || currentGame.status !== 'active') {
      router.push('/');
    }
  }, [currentGame, router]);

  // Om spelet inte är aktivt, visa ingenting medan omdirigeringen sker
  if (!currentGame || currentGame.status !== 'active') {
    return null;
  }

  return <PageGame />;
} 