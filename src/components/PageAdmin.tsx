'use client';

import { useGame } from '@/context/GameContext';
import GameSetup from '@/components/GameSetup';

export default function PageAdmin() {
  const { currentGame } = useGame();

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Golf Match Admin</h1>
          <GameSetup />
        </div>
      </div>
    </main>
  );
} 