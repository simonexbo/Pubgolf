'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';

export default function AdminEventInfoEditor() {
  const { currentGame, updateEventInfo } = useGame();
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!currentGame) return;
    setLocation(currentGame.location ?? '');
    setEventDate(currentGame.eventDate ?? '');
    setEventTime(currentGame.eventTime ?? '');
    setDescription(currentGame.description ?? '');
  }, [currentGame?.id]);

  if (!currentGame) return null;

  const save = (next: Partial<{ location: string; eventDate: string; eventTime: string; description: string }>) => {
    updateEventInfo({
      location,
      eventDate,
      eventTime,
      description,
      ...next
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Eventinfo</h3>
      <p className="text-xs text-gray-500 mb-4">
        Visas för deltagare på anmälningssidan och i den kopierbara inbjudningstexten.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Plats
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => save({ location })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="t.ex. Södermalm, Stockholm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
              Datum
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              onBlur={() => save({ eventDate })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700">
              Tid
            </label>
            <input
              type="time"
              id="eventTime"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              onBlur={() => save({ eventTime })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Kort beskrivning av upplägget
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => save({ description })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="t.ex. Klassisk pubgolf, 9 hål/barer, lag om 2 personer."
          />
        </div>
      </div>
    </div>
  );
}
