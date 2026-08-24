'use client';

import { useEffect, useState } from 'react';

const ADMIN_AUTH_KEY = 'pubgolf_admin_authed';

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      setAuthed(true);
    }
    setChecked(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (expected && password === expected) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setAuthed(true);
      setError('');
    } else {
      setError('Fel lösenord');
    }
  };

  if (!checked) return null;

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Lösenord
              </label>
              <input
                type="password"
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Logga in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
