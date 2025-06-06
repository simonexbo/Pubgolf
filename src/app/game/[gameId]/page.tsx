'use client';

import { useGame } from '@/context/GameContext';
import PageGame from '@/components/PageGame';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { use } from 'react';

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { currentGame, joinGame } = useGame();
  const router = useRouter();
  const { gameId } = use(params);

  // När sidan laddas, anslut till spelet med det angivna ID:t
  useEffect(() => {
    joinGame(gameId);
  }, [gameId]);

  // Om spelet inte är aktivt, omdirigera till admin-sidan
  useEffect(() => {
    if (currentGame && currentGame.status !== 'active') {
      router.push('/');
    }
  }, [currentGame, router]);

  // Om spelet inte är aktivt, visa ingenting medan omdirigeringen sker
  if (!currentGame || currentGame.status !== 'active') {
    return null;
  }

  return <PageGame />;
} 