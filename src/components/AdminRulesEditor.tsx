'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { AdjustmentRule } from '@/types/game';

export default function AdminRulesEditor() {
  const { currentGame, updateAdjustmentRules, updateTotalRounds } = useGame();
  const [newLabel, setNewLabel] = useState('');
  const [newSeconds, setNewSeconds] = useState('');

  if (!currentGame) return null;

  const bars = currentGame.bars || [];
  const rules = currentGame.adjustmentRules || [];
  const totalRounds = currentGame.totalRounds ?? bars.length;

  const handleRoundsChange = (value: string) => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n > 0) {
      updateTotalRounds(n);
    }
  };

  const handleRuleValueChange = (key: string, seconds: string) => {
    const parsed = parseFloat(seconds);
    if (isNaN(parsed)) return;

    const updated = rules.map(rule =>
      rule.key === key ? { ...rule, value: Math.round(parsed * 100) } : rule
    );
    updateAdjustmentRules(updated);
  };

  const handleRuleLabelChange = (key: string, label: string) => {
    const updated = rules.map(rule => (rule.key === key ? { ...rule, label } : rule));
    updateAdjustmentRules(updated);
  };

  const handleRemoveRule = (key: string) => {
    updateAdjustmentRules(rules.filter(rule => rule.key !== key));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || newSeconds.trim() === '') return;

    const parsed = parseFloat(newSeconds);
    if (isNaN(parsed)) return;

    const newRule: AdjustmentRule = {
      key: crypto.randomUUID(),
      label: newLabel.trim(),
      value: Math.round(parsed * 100)
    };

    updateAdjustmentRules([...rules, newRule]);
    setNewLabel('');
    setNewSeconds('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Regler</h3>

      <div className="mb-6">
        <label htmlFor="totalRounds" className="block text-sm font-medium text-gray-700">
          Antal rundor
        </label>
        <input
          type="number"
          id="totalRounds"
          min={1}
          value={totalRounds}
          onChange={(e) => handleRoundsChange(e.target.value)}
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Standard är en runda per bar ({bars.length} {bars.length === 1 ? 'bar' : 'barer'} tillagda).
        </p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Bonus/avdrag</h4>
        <p className="text-xs text-gray-500 mb-3">
          Positiv sekundsiffra = tidstillägg (bestraffning). Negativ = avdrag (bonus).
        </p>
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.key} className="flex items-center gap-2">
              <input
                type="text"
                value={rule.label}
                onChange={(e) => handleRuleLabelChange(rule.key, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                step="0.1"
                value={rule.value / 100}
                onChange={(e) => handleRuleValueChange(rule.key, e.target.value)}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">sek</span>
              <button
                type="button"
                onClick={() => handleRemoveRule(rule.key)}
                className="text-red-500 hover:text-red-700 text-sm px-2"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddRule} className="flex items-center gap-2 mt-4">
          <input
            type="text"
            placeholder="Ny regel, t.ex. Spill"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Sekunder"
            value={newSeconds}
            onChange={(e) => setNewSeconds(e.target.value)}
            className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
          >
            Lägg till regel
          </button>
        </form>
      </div>
    </div>
  );
}
