'use client';

import { useGame } from '@/context/GameContext';

export default function Leaderboard() {
  const { currentGame, getLeaderboard } = useGame();

  if (!currentGame) return null;

  const leaderboard = getLeaderboard();

  // Format ss:SS
  const formatTimeHundradelar = (t: number) => {
    const ss = String(Math.floor(t / 100)).padStart(2, '0');
    const SS = String(t % 100).padStart(2, '0');
    return `${ss}:${SS}`;
  };

  return (
    <div className="bg-white rounded-ios shadow-ios p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-6 text-center text-gray-900 tracking-tight">Leaderboard</h2>
      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.team.id} 
            className="flex items-center justify-between p-4 border border-iosgray rounded-ios bg-iosgray-light shadow-ios"
          >
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-iosblue">#{index + 1}</span>
              <div>
                <h3 className="font-medium text-gray-900">{entry.team.name}</h3>
                <p className="text-xs text-gray-500">
                  {entry.team.players.map(p => p.name).join(' & ')}
                </p>
              </div>
            </div>
            <div className="text-base font-bold text-gray-900">
              {formatTimeHundradelar(entry.totalScore)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 