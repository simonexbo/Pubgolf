'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Bar } from '@/types/game';
import AdminRulesEditor from '@/components/AdminRulesEditor';
import AdminEventInfoEditor from '@/components/AdminEventInfoEditor';
import AdminInvite from '@/components/AdminInvite';

export default function GameSetup() {
  const { currentGame, createGame, addBar, updateBar, removeBar, startGame, removeTeam, deleteGame } = useGame();
  const [barName, setBarName] = useState('');
  const [barLocation, setBarLocation] = useState('');
  const [barDrink, setBarDrink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setError(null);
    setIsCreating(true);
    try {
      await createGame();
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Kunde inte skapa spelet. Försök igen.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddBar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentGame) {
      setError('Inget aktivt spel hittades');
      return;
    }

    const newBar: Bar = {
      id: crypto.randomUUID(),
      name: barName,
      location: barLocation,
      teamId: null,
      drink: barDrink
    };

    try {
      await addBar(newBar);
      // Clear form
      setBarName('');
      setBarLocation('');
      setBarDrink('');
    } catch (error) {
      console.error('Error adding bar:', error);
      setError('Kunde inte lägga till baren. Försök igen.');
    }
  };

  const handleDeleteGame = async () => {
    if (!currentGame) return;
    const confirmed = window.confirm(
      `Ta bort spelet "${currentGame.id}" permanent? Alla anmälda lag, barer och regler för detta spel raderas och går inte att återställa.`
    );
    if (!confirmed) return;

    try {
      await deleteGame();
    } catch (error) {
      console.error('Error deleting game:', error);
      setError('Kunde inte ta bort spelet. Försök igen.');
    }
  };

  const handleUpdateBar = async (barId: string, updates: Partial<Bar>) => {
    try {
      await updateBar(barId, updates);
    } catch (error) {
      console.error('Error updating bar:', error);
      setError('Kunde inte uppdatera baren. Försök igen.');
    }
  };

  const handleRemoveBar = async (barId: string, barName: string) => {
    const confirmed = window.confirm(`Ta bort baren "${barName}"?`);
    if (!confirmed) return;

    try {
      await removeBar(barId);
    } catch (error) {
      console.error('Error removing bar:', error);
      setError('Kunde inte ta bort baren. Försök igen.');
    }
  };

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    const confirmed = window.confirm(`Ta bort laget "${teamName}"?`);
    if (!confirmed) return;

    try {
      await removeTeam(teamId);
    } catch (error) {
      console.error('Error removing team:', error);
      setError('Kunde inte ta bort laget. Försök igen.');
    }
  };

  const handleStartGame = async () => {
    setError(null);

    if (!currentGame) {
      setError('Inget aktivt spel hittades');
      return;
    }

    const fullTeams = (currentGame.teams || []).filter(t => t.players.length === 2);
    const bars = currentGame.bars || [];

    if (fullTeams.length >= 2 && bars.length > 0) {
      try {
        await startGame();
      } catch (error) {
        console.error('Error starting game:', error);
        setError('Kunde inte starta spelet. Försök igen.');
      }
    }
  };

  if (!currentGame) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <p className="mb-4 text-gray-600">Inget aktivt spel just nu.</p>
        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Skapar spel...' : 'Skapa nytt spel'}
        </button>
      </div>
    );
  }

  const teams = currentGame.teams || [];
  const bars = currentGame.bars || [];
  const fullTeams = teams.filter(t => t.players.length === 2);
  const waitingTeams = teams.filter(t => t.players.length < 2);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Spelinställningar</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Spel-ID: {currentGame.id}</p>
        <button
          type="button"
          onClick={handleDeleteGame}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Ta bort spel
        </button>
      </div>

      {currentGame.status === 'active' && (
        <p className="text-sm mb-4">
          <a href={`/game/${currentGame.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            Visa spelvyn ↗
          </a>
        </p>
      )}

      <AdminEventInfoEditor />
      <AdminInvite />

      <div className="mt-8">
        {/* Bar Form */}
        <div>
          <h3 className="text-xl font-bold mb-4">Lägg till Bar</h3>
          <form onSubmit={handleAddBar} className="space-y-4">
            <div>
              <label htmlFor="barName" className="block text-sm font-medium text-gray-700">
                Barnamn
              </label>
              <input
                type="text"
                id="barName"
                value={barName}
                onChange={(e) => setBarName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="barLocation" className="block text-sm font-medium text-gray-700">
                Plats
              </label>
              <input
                type="text"
                id="barLocation"
                value={barLocation}
                onChange={(e) => setBarLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="barDrink" className="block text-sm font-medium text-gray-700">
                Dryck
              </label>
              <input
                type="text"
                id="barDrink"
                value={barDrink}
                onChange={(e) => setBarDrink(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="t.ex. Ljus lager, IPA, Cider..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Lägg till Bar
            </button>
          </form>
        </div>
      </div>

      <AdminRulesEditor />

      {/* Start Game Button / Status */}
      {currentGame.status === 'pending' && (
        <>
          {waitingTeams.length > 0 && (
            <p className="text-sm text-amber-600 mt-8">
              {waitingTeams.length} lag väntar på en till spelare innan spelet kan starta.
            </p>
          )}
          {fullTeams.length >= 2 && bars.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleStartGame}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-semibold"
              >
                Starta Spel
              </button>
            </div>
          )}
        </>
      )}
      {currentGame.status === 'active' && (
        <div className="mt-8 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-center font-semibold">
          ✅ Spelet är igång
        </div>
      )}
      {currentGame.status === 'completed' && (
        <div className="mt-8 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-center font-semibold">
          Spelet är avslutat
        </div>
      )}

      {/* List of added teams and bars */}
      {(teams.length > 0 || bars.length > 0) && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teams List */}
            {teams.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Anmälda Lag</h3>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{team.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team.id, team.name)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Ta bort
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">Åtkomstkod: {team.accessCode}</p>
                      <div className="mt-2">
                        <p className="font-medium">Spelare:</p>
                        <ul className="list-disc list-inside">
                          {team.players.map((player) => (
                            <li key={player.id}>{player.name}</li>
                          ))}
                        </ul>
                        {team.players.length < 2 && (
                          <p className="text-xs text-amber-600 mt-1">Väntar på en till spelare</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bars List */}
            {bars.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Tillagda Barer</h3>
                <div className="space-y-4">
                  {bars.map((bar) => (
                    <div key={bar.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <input
                          type="text"
                          defaultValue={bar.name}
                          onBlur={(e) => handleUpdateBar(bar.id, { name: e.target.value })}
                          className="font-semibold text-lg border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded px-1 -mx-1 bg-transparent flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBar(bar.id, bar.name)}
                          className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                        >
                          Ta bort
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">Plats</label>
                          <input
                            type="text"
                            defaultValue={bar.location}
                            onBlur={(e) => handleUpdateBar(bar.id, { location: e.target.value })}
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Dryck</label>
                          <input
                            type="text"
                            defaultValue={bar.drink ?? ''}
                            onBlur={(e) => handleUpdateBar(bar.id, { drink: e.target.value })}
                            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 