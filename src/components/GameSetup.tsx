'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Team, Bar } from '@/types/game';

export default function GameSetup() {
  const { currentGame, createGame, addTeam, addBar, startGame } = useGame();
  const [teamName, setTeamName] = useState('');
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [barName, setBarName] = useState('');
  const [barLocation, setBarLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Skapa spel en gång när komponenten laddas
  useEffect(() => {
    const initializeGame = async () => {
      if (!currentGame) {
        try {
          const gameId = await createGame();
          console.log('Created new game with ID:', gameId);
        } catch (error) {
          console.error('Error creating game:', error);
          setError('Kunde inte skapa spelet. Vänligen uppdatera sidan.');
        }
      }
      setIsLoading(false);
    };

    initializeGame();
  }, []);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentGame) {
      setError('Inget aktivt spel hittades');
      return;
    }

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: teamName,
      accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      players: [
        {
          id: crypto.randomUUID(),
          name: player1Name,
          handicap: 0
        },
        {
          id: crypto.randomUUID(),
          name: player2Name,
          handicap: 0
        }
      ]
    };

    try {
      await addTeam(newTeam);
      // Clear form
      setTeamName('');
      setPlayer1Name('');
      setPlayer2Name('');
    } catch (error) {
      console.error('Error adding team:', error);
      setError('Kunde inte lägga till laget. Försök igen.');
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
      teamId: null
    };

    try {
      await addBar(newBar);
      // Clear form
      setBarName('');
      setBarLocation('');
    } catch (error) {
      console.error('Error adding bar:', error);
      setError('Kunde inte lägga till baren. Försök igen.');
    }
  };

  const handleStartGame = async () => {
    setError(null);

    if (!currentGame) {
      setError('Inget aktivt spel hittades');
      return;
    }

    const teams = currentGame.teams || [];
    const bars = currentGame.bars || [];

    if (teams.length >= 2 && bars.length > 0) {
      try {
        await startGame();
      } catch (error) {
        console.error('Error starting game:', error);
        setError('Kunde inte starta spelet. Försök igen.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Laddar spel...</p>
      </div>
    );
  }

  if (!currentGame) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Kunde inte ladda spelet. Vänligen uppdatera sidan.</p>
      </div>
    );
  }

  const teams = currentGame.teams || [];
  const bars = currentGame.bars || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Skapa Lag och Barer</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Debug display */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <p>Status: {currentGame.status}</p>
        <p>Spel-ID: {currentGame.id}</p>
        <p>Datum: {new Date(currentGame.date).toLocaleDateString()}</p>
        <p>Antal lag: {teams.length}</p>
        <p>Antal barer: {bars.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Form */}
        <div>
          <h3 className="text-xl font-bold mb-4">Lägg till Lag</h3>
          <form onSubmit={handleAddTeam} className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                Lagnamn
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="player1Name" className="block text-sm font-medium text-gray-700">
                Spelare 1
              </label>
              <input
                type="text"
                id="player1Name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="player2Name" className="block text-sm font-medium text-gray-700">
                Spelare 2
              </label>
              <input
                type="text"
                id="player2Name"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Lägg till Lag
            </button>
          </form>
        </div>

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

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Lägg till Bar
            </button>
          </form>
        </div>
      </div>

      {/* Start Game Button */}
      {teams.length >= 2 && bars.length > 0 && (
        <div className="mt-8">
          <button
            onClick={handleStartGame}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-semibold"
          >
            Starta Spel
          </button>
        </div>
      )}

      {/* List of added teams and bars */}
      {(teams.length > 0 || bars.length > 0) && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teams List */}
            {teams.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Tillagda Lag</h3>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{team.name}</h4>
                      <p className="text-sm text-gray-600">Åtkomstkod: {team.accessCode}</p>
                      <div className="mt-2">
                        <p className="font-medium">Spelare:</p>
                        <ul className="list-disc list-inside">
                          {team.players.map((player) => (
                            <li key={player.id}>{player.name}</li>
                          ))}
                        </ul>
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
                      <h4 className="font-semibold text-lg">{bar.name}</h4>
                      <p className="text-sm text-gray-600">Plats: {bar.location}</p>
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