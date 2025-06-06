'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';

export default function TeamLogin() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const { loginTeam, loggedInTeam, logoutTeam } = useGame();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessCode.trim()) {
      setError('Vänligen ange en åtkomstkod');
      return;
    }

    const success = loginTeam(accessCode);
    if (!success) {
      setError('Ogiltig åtkomstkod');
    }
  };

  if (loggedInTeam) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Inloggad som {loggedInTeam.name}</h2>
        <button
          onClick={logoutTeam}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logga ut
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Logga in med åtkomstkod</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
            Åtkomstkod
          </label>
          <input
            type="text"
            id="accessCode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ange åtkomstkod"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Logga in
        </button>
      </form>
    </div>
  );
} 