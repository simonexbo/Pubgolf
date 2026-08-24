import { AdjustmentRule } from '@/types/game';

export const DEFAULT_ADJUSTMENTS: AdjustmentRule[] = [
  { key: 'spill', label: 'Spill', value: 200 },
  { key: 'felBestallning', label: 'Fel beställning', value: 300 },
  { key: 'toalett', label: 'Toalett', value: 200 },
  { key: 'jagerbomb', label: 'Jägerbomb', value: -200 },
  { key: 'perfektTeknik', label: 'Perfekt teknik', value: -100 },
  { key: 'publikjubel', label: 'Publikjubel', value: -50 },
];
