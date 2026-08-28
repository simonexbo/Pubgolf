'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Team, Score, Bar, AdjustmentRule, Player } from '@/types/game';
import { database } from '@/lib/firebase';
import { ref, set, onValue, push, update, remove } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { generateMatches } from '@/utils/matchGenerator';
import { DEFAULT_ADJUSTMENTS } from '@/utils/defaultAdjustments';

const ACTIVE_GAME_KEY = 'pubgolf_active_game_id';

interface GameContextType {
  currentGame: Game | null;
  loggedInTeam: Team | null;
  createGame: () => Promise<string>; // Returnerar gameId
  addTeam: (team: Team) => Promise<void>;
  addScore: (score: Score) => Promise<void>;
  addBar: (bar: Bar) => Promise<void>;
  joinTeam: (teamId: string, playerName: string) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  deleteGame: () => Promise<void>;
  updateAdjustmentRules: (rules: AdjustmentRule[]) => Promise<void>;
  updateTotalRounds: (totalRounds: number) => Promise<void>;
  updateEventInfo: (info: { location: string; eventDate: string; eventTime: string; description: string }) => Promise<void>;
  startGame: () => Promise<void>;
  getLeaderboard: () => Array<{ team: Team; totalScore: number }>;
  loginTeam: (accessCode: string) => Team | null;
  logoutTeam: () => void;
  joinGame: (gameId: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [loggedInTeam, setLoggedInTeam] = useState<Team | null>(null);
  const [watchedGameId, setWatchedGameId] = useState<string | null>(null);
  const router = useRouter();

  // Återställ persisterat spel-ID vid mount
  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_GAME_KEY);
    if (savedId) setWatchedGameId(savedId);
  }, []);

  // Lyssna på realtidsuppdateringar för spelet
  useEffect(() => {
    if (!watchedGameId) return;

    const gameRef = ref(database, `games/${watchedGameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      // Firebase Realtime Database sparar inte tomma arrayer - de blir undefined vid läsning,
      // så vi normaliserar tillbaka till [] här, på det enda stället data kommer in i appen.
      setCurrentGame(data ? {
        ...data,
        date: new Date(data.date),
        teams: data.teams || [],
        bars: data.bars || [],
        matches: data.matches || []
      } : null);
    });

    return () => unsubscribe();
  }, [watchedGameId]);

  const createGame = async (): Promise<string> => {
    const gameId = `GOLF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newGame: Game = {
      id: gameId,
      date: new Date().toISOString(),
      teams: [],
      matches: [],
      bars: [],
      status: 'pending',
      currentRound: 1,
      adjustmentRules: DEFAULT_ADJUSTMENTS
    };

    try {
      await set(ref(database, `games/${gameId}`), newGame);
      localStorage.setItem(ACTIVE_GAME_KEY, gameId);
      setWatchedGameId(gameId);
      return gameId;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const addTeam = async (team: Team) => {
    if (!currentGame) return;
    
    const gameRef = ref(database, `games/${currentGame.id}`);
    const updatedTeams = [...(currentGame.teams || []), team];
    
    try {
      await update(gameRef, { teams: updatedTeams });
    } catch (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  };

  const addScore = async (score: Score) => {
    if (!currentGame) return;

    const gameRef = ref(database, `games/${currentGame.id}`);

    // Uppdatera matcher med den nya poängen
    const updatedMatches = currentGame.matches.map(match => {
      if (
        match.round === currentGame.currentRound &&
        (match.team1Id === score.teamId || match.team2Id === score.teamId)
      ) {
        return {
          ...match,
          scores: [...(match.scores || []), score]
        };
      }
      return match;
    });

    // Kontrollera om alla matcher i nuvarande omgång har scores för båda lag
    const matchesThisRound = updatedMatches.filter(m => m.round === currentGame.currentRound);
    const allScored = matchesThisRound.every(
      m =>
        (m.scores ?? []).some(s => s.teamId === m.team1Id) &&
        (m.scores ?? []).some(s => s.teamId === m.team2Id)
    );

    // Om alla har lagt in poäng, öka currentRound (om det finns fler rundor)
    let updateObj: any = { matches: updatedMatches };
    if (allScored && currentGame.currentRound < Math.max(...currentGame.matches.map(m => m.round))) {
      updateObj.currentRound = currentGame.currentRound + 1;
    }

    await update(gameRef, updateObj);
  };

  const addBar = async (bar: Bar) => {
    if (!currentGame) return;
    
    const gameRef = ref(database, `games/${currentGame.id}`);
    const updatedBars = [...(currentGame.bars || []), bar];
    
    try {
      await update(gameRef, { bars: updatedBars });
    } catch (error) {
      console.error('Error adding bar:', error);
      throw error;
    }
  };

  const joinTeam = async (teamId: string, playerName: string) => {
    if (!currentGame) return;

    const team = currentGame.teams.find(t => t.id === teamId);
    if (!team) throw new Error('Laget hittades inte');
    if (team.players.length >= 2) throw new Error('Laget är redan fullt');

    const newPlayer: Player = { id: crypto.randomUUID(), name: playerName };
    const updatedTeams = currentGame.teams.map(t =>
      t.id === teamId ? { ...t, players: [...t.players, newPlayer] } : t
    );

    const gameRef = ref(database, `games/${currentGame.id}`);

    try {
      await update(gameRef, { teams: updatedTeams });
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    }
  };

  const removeTeam = async (teamId: string) => {
    if (!currentGame) return;

    const updatedTeams = currentGame.teams.filter(t => t.id !== teamId);
    const gameRef = ref(database, `games/${currentGame.id}`);

    try {
      await update(gameRef, { teams: updatedTeams });
    } catch (error) {
      console.error('Error removing team:', error);
      throw error;
    }
  };

  const deleteGame = async () => {
    if (!currentGame) return;

    try {
      await remove(ref(database, `games/${currentGame.id}`));
      localStorage.removeItem(ACTIVE_GAME_KEY);
      setWatchedGameId(null);
      setCurrentGame(null);
      setLoggedInTeam(null);
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  };

  const updateEventInfo = async (info: { location: string; eventDate: string; eventTime: string; description: string }) => {
    if (!currentGame) return;

    const gameRef = ref(database, `games/${currentGame.id}`);

    try {
      await update(gameRef, info);
    } catch (error) {
      console.error('Error updating event info:', error);
      throw error;
    }
  };

  const updateAdjustmentRules = async (rules: AdjustmentRule[]) => {
    if (!currentGame) return;

    const gameRef = ref(database, `games/${currentGame.id}`);

    try {
      await update(gameRef, { adjustmentRules: rules });
    } catch (error) {
      console.error('Error updating adjustment rules:', error);
      throw error;
    }
  };

  const updateTotalRounds = async (totalRounds: number) => {
    if (!currentGame) return;

    const gameRef = ref(database, `games/${currentGame.id}`);

    try {
      await update(gameRef, { totalRounds });
    } catch (error) {
      console.error('Error updating total rounds:', error);
      throw error;
    }
  };

  const startGame = async () => {
    if (!currentGame) return;

    const fullTeams = currentGame.teams.filter(t => t.players.length === 2);
    if (fullTeams.length < 2) return;

    const gameRef = ref(database, `games/${currentGame.id}`);

    const matches = generateMatches(fullTeams, currentGame.bars, currentGame.totalRounds);

    await update(gameRef, {
      status: 'active',
      matches,
      currentRound: 1
    });

    // Omdirigera till spelsidan
    router.push(`/game/${currentGame.id}`);
  };

  const joinGame = async (gameId: string) => {
    localStorage.setItem(ACTIVE_GAME_KEY, gameId);
    setWatchedGameId(gameId);
  };

  const getLeaderboard = () => {
    if (!currentGame) return [];
    
    return currentGame.teams.map(team => {
      const totalScore = currentGame.matches.reduce((sum, match) => {
        const teamScores = (match.scores || []).filter(score => score.teamId === team.id);
        return sum + teamScores.reduce((teamSum, score) => teamSum + score.score, 0);
      }, 0);
      
      return { team, totalScore };
    }).sort((a, b) => a.totalScore - b.totalScore);
  };

  const loginTeam = (accessCode: string) => {
    if (!currentGame) return null;
    const team = currentGame.teams.find(t => t.accessCode === accessCode);
    if (team) {
      setLoggedInTeam(team);
    }
    return team || null;
  };

  const logoutTeam = () => {
    setLoggedInTeam(null);
  };

  return (
    <GameContext.Provider value={{
      currentGame,
      loggedInTeam,
      createGame,
      addTeam,
      addScore,
      addBar,
      joinTeam,
      removeTeam,
      deleteGame,
      updateAdjustmentRules,
      updateTotalRounds,
      updateEventInfo,
      startGame,
      getLeaderboard,
      loginTeam,
      logoutTeam,
      joinGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 