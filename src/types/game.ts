export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  accessCode: string;
  players: Player[];
}

export interface Score {
  id: string;
  playerId: string;
  teamId: string;
  score: number;
  holeNumber: number;
  submittedByTeamId: string;
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1Id: string;
  team2Id: string;
  barId: string;
  scores: Score[];
}

export interface Bar {
  id: string;
  name: string;
  location: string;
  teamId: string | null;
  drink?: string;
}

export interface AdjustmentRule {
  key: string;
  label: string;
  value: number; // hundradels sekunder; positivt = tidstillägg, negativt = avdrag
}

export interface Game {
  id: string;
  date: string;
  teams: Team[];
  matches: Match[];
  bars: Bar[];
  status: 'pending' | 'active' | 'completed';
  currentRound: number;
  adjustmentRules?: AdjustmentRule[];
  totalRounds?: number;
  location?: string;
  eventDate?: string;
  eventTime?: string;
  description?: string;
}

export interface Hole {
  number: number;
  par: number;
} 