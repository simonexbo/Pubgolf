'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Match } from '@/types/game';

export default function MatchSchedule() {
  const { currentGame } = useGame();

  if (!currentGame) return null;

  const matches = currentGame.matches || [];
  const teams = currentGame.teams || [];

  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Okänd lag';
  };

  const formatTimeHundradelar = (t: number) => {
    const ss = String(Math.floor(t / 100)).padStart(2, '0');
    const SS = String(t % 100).padStart(2, '0');
    return `${ss}:${SS}`;
  };

  return (
    <div className="bg-white rounded-ios shadow-ios p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 tracking-tight">Matchschema</h2>
      <div className="space-y-4">
        {rounds.map(round => (
          <div key={round} className="border border-iosgray rounded-ios p-4 bg-iosgray-light">
            <h3 className="font-medium mb-2 text-iosblue">Runda {round}</h3>
            <div className="space-y-2">
              {matches
                .filter(match => match.round === round)
                .map(match => {
                  const team1Score = (match.scores || []).filter(s => s.teamId === match.team1Id).reduce((sum, s) => sum + s.score, 0);
                  const team2Score = (match.scores || []).filter(s => s.teamId === match.team2Id).reduce((sum, s) => sum + s.score, 0);
                  const minScore = Math.min(team1Score, team2Score);
                  return (
                    <div key={match.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{getTeamName(match.team1Id)}</span>
                        <span className="mx-2 text-gray-400">vs</span>
                        <span className="font-medium text-gray-900">{getTeamName(match.team2Id)}</span>
                      </div>
                      <div className="text-xs text-gray-900">
                        <span className={team1Score === minScore ? 'font-bold' : ''}>{formatTimeHundradelar(team1Score)}</span>
                        <span className="mx-1 text-gray-400">-</span>
                        <span className={team2Score === minScore ? 'font-bold' : ''}>{formatTimeHundradelar(team2Score)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 