'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { getDeviceTeamId, setDeviceTeamId } from '@/utils/deviceTeam';

export default function JoinGame() {
  const { currentGame, addTeam, joinTeam } = useGame();
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentGame) return;
    const stored = getDeviceTeamId(currentGame.id);
    if (stored) setMyTeamId(stored);
  }, [currentGame?.id]);

  if (!currentGame) {
    return (
      <main className="min-h-screen bg-iosgray-light flex items-center justify-center py-8">
        <p className="text-gray-500">Laddar...</p>
      </main>
    );
  }

  const myTeam = myTeamId ? currentGame.teams.find(t => t.id === myTeamId) ?? null : null;

  // Redan anmäld lag ska alltid kunna se sin info/åtkomstkod, oavsett om spelet
  // har startat eller inte - annars försvinner koden så fort admin startar spelet.
  if (myTeam) {
    return (
      <main className="min-h-screen bg-iosgray-light flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-ios shadow-ios p-6 max-w-md w-full">
          <h1 className="text-lg font-semibold mb-4 text-center text-gray-900">Du är anmäld!</h1>
          <div className="p-4 bg-iosgray-light rounded-ios border border-iosgray text-center space-y-2">
            <div>
              <span className="text-sm text-gray-600">Lag:</span>{' '}
              <span className="font-semibold text-gray-900">{myTeam.name}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spelare:</p>
              {myTeam.players.map(p => (
                <p key={p.id} className="font-medium text-gray-900">{p.name}</p>
              ))}
              {myTeam.players.length < 2 && (
                <p className="text-sm text-amber-600 mt-1">Väntar på en lagkompis...</p>
              )}
            </div>
            <div className="pt-2 border-t border-iosgray mt-2">
              <p className="text-xs text-gray-500">Åtkomstkod (behövs för att rapportera poäng under spelet):</p>
              <p className="text-2xl font-mono tracking-widest text-gray-900">{myTeam.accessCode}</p>
            </div>
          </div>
          {currentGame.status === 'active' && (
            <a
              href={`/game/${currentGame.id}`}
              className="block text-center mt-4 text-iosblue underline font-medium"
            >
              Gå till spelet
            </a>
          )}
        </div>
      </main>
    );
  }

  if (currentGame.status !== 'pending') {
    return (
      <main className="min-h-screen bg-iosgray-light flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-ios shadow-ios p-6 max-w-md w-full text-center">
          <h1 className="text-lg font-semibold mb-2 text-gray-900">Anmälan är stängd</h1>
          <p className="text-gray-600 mb-4">Spelet har redan startat.</p>
          {currentGame.status === 'active' && (
            <a href={`/game/${currentGame.id}`} className="text-iosblue underline font-medium">
              Gå till spelet
            </a>
          )}
        </div>
      </main>
    );
  }

  const waitingTeams = currentGame.teams.filter(t => t.players.length === 1);
  const hasEventInfo = currentGame.location || currentGame.eventDate || currentGame.eventTime || currentGame.description;

  const isCreatingNew = selectedTeamId === '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!playerName.trim()) return;

    setIsSubmitting(true);
    try {
      if (isCreatingNew) {
        if (!teamName.trim()) return;

        const nameTaken = currentGame.teams.some(
          t => t.name.trim().toLowerCase() === teamName.trim().toLowerCase()
        );
        if (nameTaken) {
          setError('Det finns redan ett lag med det namnet. Välj det i listan ovan istället, eller ett annat lagnamn.');
          return;
        }

        const newTeamId = crypto.randomUUID();
        await addTeam({
          id: newTeamId,
          name: teamName.trim(),
          accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          players: [{ id: crypto.randomUUID(), name: playerName.trim() }]
        });
        setDeviceTeamId(currentGame.id, newTeamId);
        setMyTeamId(newTeamId);
      } else {
        await joinTeam(selectedTeamId, playerName.trim());
        setDeviceTeamId(currentGame.id, selectedTeamId);
        setMyTeamId(selectedTeamId);
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte anmäla dig. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-iosgray-light py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900 tracking-tight">Pubgolf</h1>

        {hasEventInfo && (
          <div className="bg-white rounded-ios shadow-ios p-4 mb-6 text-center space-y-1">
            {currentGame.location && <p className="text-sm text-gray-700">📍 {currentGame.location}</p>}
            {(currentGame.eventDate || currentGame.eventTime) && (
              <p className="text-sm text-gray-700">
                📅 {currentGame.eventDate} {currentGame.eventTime && `kl ${currentGame.eventTime}`}
              </p>
            )}
            {currentGame.description && (
              <p className="text-sm text-gray-600 mt-2">{currentGame.description}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-ios shadow-ios p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-ios border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teamSelect" className="block text-xs font-medium text-gray-700 mb-1">
                Lag
              </label>
              <select
                id="teamSelect"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="block w-full rounded-ios border-iosgray shadow-sm focus:border-iosblue focus:ring-iosblue"
              >
                <option value="">+ Skapa nytt lag</option>
                {waitingTeams.map(t => (
                  <option key={t.id} value={t.id}>
                    Häng på {t.name} ({t.players[0]?.name})
                  </option>
                ))}
              </select>
            </div>

            {isCreatingNew && (
              <div>
                <label htmlFor="teamName" className="block text-xs font-medium text-gray-700 mb-1">
                  Lagnamn
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="block w-full rounded-ios border-iosgray shadow-sm focus:border-iosblue focus:ring-iosblue"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="playerName" className="block text-xs font-medium text-gray-700 mb-1">
                Ditt namn
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="block w-full rounded-ios border-iosgray shadow-sm focus:border-iosblue focus:ring-iosblue"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-iosblue text-white py-2 px-4 rounded-ios font-semibold shadow-ios hover:bg-iosblue/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Anmäler...' : isCreatingNew ? 'Skapa lag' : 'Häng på laget'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
