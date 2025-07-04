'use client';

import { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';

export default function ScoreCard() {
  const { currentGame, loggedInTeam, addScore } = useGame();
  const [score, setScore] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0); // hundradelar
  const [isRunning, setIsRunning] = useState(false);
  const [spillActive, setSpillActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bonus/avdrag-alternativ
  const adjustments = [
    { key: 'spill', label: 'Spill', value: 200 },
    { key: 'felBestallning', label: 'Fel beställning', value: 300 },
    { key: 'toalett', label: 'Toalett', value: 200 },
    { key: 'jagerbomb', label: 'Jägerbomb', value: -200 },
    { key: 'perfektTeknik', label: 'Perfekt teknik', value: -100 },
    { key: 'publikjubel', label: 'Publikjubel', value: -50 },
  ];
  const [activeAdjustments, setActiveAdjustments] = useState<string[]>([]);

  const totalAdjustment = adjustments
    .filter(adj => activeAdjustments.includes(adj.key))
    .reduce((sum, adj) => sum + adj.value, 0);

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

    const adjustedTimer = timer + totalAdjustment;

    const newScore = {
      id: crypto.randomUUID(),
      playerId: opponentTeam.players[0].id, // motståndarens första spelare
      teamId: opponentTeam.id,              // motståndarlaget
      score: adjustedTimer, // antal hundradelar
      holeNumber: currentGame.currentRound,
      submittedByTeamId: loggedInTeam.id,
      ...(activeAdjustments.length > 0 ? {
        bonuses: activeAdjustments,
        adjustment: totalAdjustment
      } : {})
    };

    try {
      await addScore(newScore);
      resetTimer();
      setActiveAdjustments([]);
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
      <h2 className="text-lg font-semibold mb-1 text-center text-gray-900 tracking-tight">Poänginmatning</h2>
      <p className="text-sm text-gray-500 text-center mb-4">Omgång {currentGame.currentRound}</p>
      <div className="space-y-4">
        {success && (
          <div className="p-2 bg-green-50 text-green-700 rounded-ios text-center border border-green-200">Poäng sparad! Går vidare till nästa omgång...</div>
        )}
        <div className="p-4 bg-iosgray-light rounded-ios border border-iosgray text-center">
          <div className="space-y-2 flex flex-col items-center">
            <div>
              <span className="text-sm font-medium text-gray-600">Bar:</span>
              <p className="text-base font-semibold text-gray-900">{currentBar.name}</p>
            </div>
            {currentBar.drink && (
              <div>
                <span className="text-sm font-medium text-gray-600">Dryck:</span>
                <p className="text-base font-semibold text-gray-900">{currentBar.drink}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-600">Motståndare:</span>
              <p className="text-base font-semibold text-gray-900">{opponentTeam?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tid till motståndarlaget</label>
          <div className="text-3xl font-mono tracking-widest mb-2">{formatTime(timer + totalAdjustment)}</div>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {adjustments.map(adj => (
              <button
                key={adj.key}
                type="button"
                onClick={() => setActiveAdjustments(prev => prev.includes(adj.key)
                  ? prev.filter(k => k !== adj.key)
                  : [...prev, adj.key])}
                className={`px-3 py-1 rounded-ios border text-xs font-semibold transition
                  ${activeAdjustments.includes(adj.key)
                    ? (adj.value > 0 ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700')
                    : 'bg-iosgray-light border-iosgray text-gray-700 hover:bg-gray-100 hover:border-gray-400'}
                `}
              >
                {adj.label} {adj.value > 0 ? `(+${adj.value / 100} sek)` : `(${adj.value / 100} sek)`}
              </button>
            ))}
          </div>
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
              Lägg till motståndarens poäng ({formatTime(timer + totalAdjustment)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 