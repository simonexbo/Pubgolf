'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { Player, Score } from '@/types/game';

export default function ScoreBoard() {
  const { currentGame, loggedInTeam } = useGame();

  if (!currentGame || !loggedInTeam) return null;

  const getPlayerScore = (playerId: string): number => {
    return currentGame.matches
      .flatMap(match => match.scores)
      .filter((score: Score) => score.playerId === playerId)
      .reduce((total: number, score: Score) => total + score.score, 0);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Nuvarande match</h2>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Inloggat lag */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{loggedInTeam.name}</h3>
          <div className="space-y-4">
            {loggedInTeam.players.map((player: Player) => (
              <div key={player.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-gray-500">Handikapp: {player.handicap}</p>
                </div>
                <div className="text-lg font-bold">
                  {getPlayerScore(player.id)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motståndarlag */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Motståndarlag</h3>
          <div className="space-y-4">
            {currentGame.teams
              .filter(team => team.id !== loggedInTeam.id)
              .map(team => (
                <div key={team.id}>
                  <h4 className="font-semibold mb-2">{team.name}</h4>
                  {team.players.map((player: Player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-500">Handikapp: {player.handicap}</p>
                      </div>
                      <div className="text-lg font-bold">
                        {getPlayerScore(player.id)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 