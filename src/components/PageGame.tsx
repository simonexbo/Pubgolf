'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import TeamLogin from '@/components/TeamLogin';
import ScoreCard from '@/components/ScoreCard';
import MatchSchedule from '@/components/MatchSchedule';
import Leaderboard from '@/components/Leaderboard';

type View = 'score' | 'leaderboard' | 'schedule';

export default function PageGame() {
  const { currentGame, loggedInTeam, addScore } = useGame();
  const [currentView, setCurrentView] = useState<View>('score');

  if (!currentGame) {
    return (
      <main className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Inget aktivt spel</h1>
            <p className="text-center text-gray-600">
              Vänligen vänta på att administratören startar ett spel.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const teams = currentGame.teams || [];
  const matches = currentGame.matches || [];
  const bars = currentGame.bars || [];

  // Hämta alla unika rundor från matcherna
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  return (
    <main className="min-h-screen bg-iosgray-light py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-8 text-center text-gray-900 tracking-tight">Golf Match</h1>
          <div className="space-y-8">
            <TeamLogin />
            {loggedInTeam && (
              <>
                {/* Navigation Menu */}
                <div className="flex gap-2 bg-white rounded-ios shadow-ios p-2 mb-2">
                  <button
                    onClick={() => setCurrentView('score')}
                    className={`flex-1 py-2 px-2 rounded-ios text-sm font-medium transition ${
                      currentView === 'score'
                        ? 'bg-iosblue text-white shadow-ios'
                        : 'bg-iosgray-light text-gray-900 hover:bg-iosgray'
                    }`}
                  >
                    Poänginmatning
                  </button>
                  <button
                    onClick={() => setCurrentView('leaderboard')}
                    className={`flex-1 py-2 px-2 rounded-ios text-sm font-medium transition ${
                      currentView === 'leaderboard'
                        ? 'bg-iosblue text-white shadow-ios'
                        : 'bg-iosgray-light text-gray-900 hover:bg-iosgray'
                    }`}
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => setCurrentView('schedule')}
                    className={`flex-1 py-2 px-2 rounded-ios text-sm font-medium transition ${
                      currentView === 'schedule'
                        ? 'bg-iosblue text-white shadow-ios'
                        : 'bg-iosgray-light text-gray-900 hover:bg-iosgray'
                    }`}
                  >
                    Matchschema
                  </button>
                </div>
                {/* Content based on selected view */}
                {currentView === 'score' && <ScoreCard />}
                {currentView === 'leaderboard' && <Leaderboard />}
                {currentView === 'schedule' && <MatchSchedule />}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 