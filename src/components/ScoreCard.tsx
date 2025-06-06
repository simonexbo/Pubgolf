'use client';

import { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';

export default function ScoreCard() {
  const { currentGame, loggedInTeam, addScore } = useGame();
  const [score, setScore] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0); // hundradelar
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!currentGame || !loggedInTeam) return null;

  // Hitta den aktuella matchen för det inloggade laget
  const currentMatch = currentGame.matches.find(match => 
    match.round === currentGame.currentRound && 
    (match.team1Id === loggedInTeam.id || match.team2Id === loggedInTeam.id)
  );
  if (!currentMatch) return null;

  // Hämta baren från matchen
  const currentBar = currentGame.bars.find(bar => bar.id === currentMatch.barId);
  if (!currentBar) return null;

  // Hitta motståndarlaget
  const opponentTeam = currentGame.teams.find(team => 
    team.id === (currentMatch.team1Id === loggedInTeam.id ? currentMatch.team2Id : currentMatch.team1Id)
  );

  if (!opponentTeam) return null;

  // Timer-funktioner
  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 10); // 10 ms = hundradelar
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Format ss:SS
  const formatTime = (t: number) => {
    const ss = String(Math.floor(t / 100)).padStart(2, '0');
    const SS = String(t % 100).padStart(2, '0');
    return `${ss}:${SS}`;
  };

  // Kontrollera om det inloggade laget redan har registrerat poäng för den aktuella baren
  const hasLoggedInTeamScored = () => {
    const barScores = (currentMatch.scores || []).filter(score => 
      score.submittedByTeamId === loggedInTeam.id
    );
    return barScores.length > 0;
  };

  const handleAddScore = async () => {
    if (timer === 0) return;

    const newScore = {
      id: crypto.randomUUID(),
      playerId: opponentTeam.players[0].id, // motståndarens första spelare
      teamId: opponentTeam.id,              // motståndarlaget
      score: timer, // antal hundradelar
      holeNumber: currentGame.currentRound,
      submittedByTeamId: loggedInTeam.id
    };

    try {
      await addScore(newScore);
      resetTimer();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Trigger re-render, redirect sker automatiskt när currentRound ändras
      }, 1000);
    } catch (error) {
      console.error('Error adding score:', error);
    }
  };

  // Kontrollera om det inloggade laget kan registrera poäng för den aktuella baren
  const canInputScore = !hasLoggedInTeamScored();

  return (
    <div className="bg-white rounded-ios shadow-ios p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 tracking-tight">Poänginmatning</h2>
      <div className="space-y-4">
        {success && (
          <div className="p-2 bg-green-50 text-green-700 rounded-ios text-center border border-green-200">Poäng sparad! Går vidare till nästa omgång...</div>
        )}
        <div className="p-4 bg-iosgray-light rounded-ios border border-iosgray flex flex-col items-center">
          <h3 className="font-medium text-iosblue">Nuvarande Bar</h3>
          <p className="text-base font-semibold text-gray-900">{currentBar.name}</p>
          {/* <p className="text-xs text-iosblue">{currentBar.location}</p> */}
          <span className="text-xs text-gray-500 mt-1">Omgång {currentGame.currentRound}</span>
        </div>
        <div className="p-4 bg-iosgray-light rounded-ios border border-iosgray flex flex-col items-center">
          <h3 className="font-medium text-yellow-700">Motståndarlag</h3>
          <p className="text-base font-semibold text-gray-900">{opponentTeam?.name}</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tid till motståndarlaget</label>
          <div className="text-3xl font-mono tracking-widest mb-2">{formatTime(timer)}</div>
          <button
            type="button"
            onClick={() => {
              if (isRunning) stopTimer();
              else startTimer();
            }}
            disabled={hasLoggedInTeamScored()}
            className={`w-full py-2 px-4 rounded-ios font-semibold shadow-ios transition text-white ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-iosblue hover:bg-iosblue/90'} ${hasLoggedInTeamScored() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRunning ? 'Stoppa timer' : 'Starta timer'}
          </button>
          {!isRunning && timer > 0 && !hasLoggedInTeamScored() && (
            <button
              onClick={handleAddScore}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-ios font-semibold shadow-ios hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition"
            >
              Lägg till motståndarens poäng ({formatTime(timer)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 