'use client';

import { useEffect, use } from 'react';
import { useGame } from '@/context/GameContext';
import JoinGame from '@/components/JoinGame';

export default function JoinPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { joinGame } = useGame();
  const { gameId } = use(params);

  useEffect(() => {
    joinGame(gameId);
  }, [gameId]);

  return <JoinGame />;
}
