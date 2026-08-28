'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';

export default function AdminInvite() {
  const { currentGame } = useGame();
  const [copied, setCopied] = useState<'link' | 'text' | null>(null);

  if (!currentGame) return null;

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${currentGame.id}`
    : `/join/${currentGame.id}`;

  const lines = ['🏌️ Pubgolf – anmälan är öppen!'];
  if (currentGame.location) lines.push(`📍 ${currentGame.location}`);
  if (currentGame.eventDate || currentGame.eventTime) {
    lines.push(`📅 ${currentGame.eventDate ?? ''} ${currentGame.eventTime ? `kl ${currentGame.eventTime}` : ''}`.trim());
  }
  if (currentGame.description) lines.push(currentGame.description);
  lines.push('');
  lines.push(`Anmäl er här: ${link}`);
  const inviteText = lines.join('\n');

  const copy = async (text: string, which: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Inbjudan</h3>

      <label className="block text-sm font-medium text-gray-700 mb-1">Anmälningslänk</label>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          readOnly
          value={link}
          className="flex-1 rounded-md border-gray-300 shadow-sm bg-gray-50 text-sm"
        />
        <button
          type="button"
          onClick={() => copy(link, 'link')}
          className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
        >
          {copied === 'link' ? 'Kopierad!' : 'Kopiera'}
        </button>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">Inbjudningstext</label>
      <textarea
        readOnly
        value={inviteText}
        rows={6}
        className="block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-sm mb-2"
      />
      <button
        type="button"
        onClick={() => copy(inviteText, 'text')}
        className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
      >
        {copied === 'text' ? 'Kopierad!' : 'Kopiera text'}
      </button>
    </div>
  );
}
