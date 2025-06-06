export interface Player {
  id: string;
  name: string;
  handicap: number;
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

export interface Game {
  id: string;
  date: string;
  teams: Team[];
  matches: Match[];
  bars: Bar[];
  status: 'pending' | 'active' | 'completed';
  currentRound: number;
}

export interface Hole {
  number: number;
  par: number;
} 