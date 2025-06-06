'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Team, Score, Bar } from '@/types/game';
import { database } from '@/lib/firebase';
import { ref, set, onValue, push, update } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { generateFixedMatches } from '@/utils/fixedMatchGenerator';

interface GameContextType {
  currentGame: Game | null;
  loggedInTeam: Team | null;
  createGame: () => Promise<string>; // Returnerar gameId
  addTeam: (team: Team) => Promise<void>;
  addScore: (score: Score) => Promise<void>;
  addBar: (bar: Bar) => Promise<void>;
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
  const router = useRouter();

  // Lyssna på realtidsuppdateringar för spelet
  useEffect(() => {
    if (currentGame?.id) {
      const gameRef = ref(database, `games/${currentGame.id}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentGame({
            ...data,
            date: new Date(data.date)
          });
        }
      });

      return () => unsubscribe();
    }
  }, [currentGame?.id]);

  const createGame = async (): Promise<string> => {
    const gameId = `GOLF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Standardlag
    const defaultTeams: Team[] = [
      {
        id: crypto.randomUUID(),
        name: "Karamellkungarna",
        accessCode: "ALPHA1",
        players: [
          { id: crypto.randomUUID(), name: "Simon", handicap: 10 },
          { id: crypto.randomUUID(), name: "Adam", handicap: 12 }
        ]
      },
      {
        id: crypto.randomUUID(),
        name: "BullBear",
        accessCode: "BETA1",
        players: [
          { id: crypto.randomUUID(), name: "Axel", handicap: 8 },
          { id: crypto.randomUUID(), name: "Pascal", handicap: 15 }
        ]
      },
      {
        id: crypto.randomUUID(),
        name: "Tjänstebil",
        accessCode: "TETA1",
        players: [
          { id: crypto.randomUUID(), name: "Emil", handicap: 8 },
          { id: crypto.randomUUID(), name: "Axel", handicap: 15 }
        ]
      },
      {
        id: crypto.randomUUID(),
        name: "Nordöst",
        accessCode: "FETA1",
        players: [
          { id: crypto.randomUUID(), name: "Ludvig", handicap: 8 },
          { id: crypto.randomUUID(), name: "Joseph", handicap: 15 }
        ]
      }
    ];

    // Standardbarer
    const defaultBars: Bar[] = [
      {
        id: crypto.randomUUID(),
        name: "Ölkafeet",
        location: "Hål 1",
        teamId: null,
        drink: "Lager"
      },
      {
        id: crypto.randomUUID(),
        name: "Old Nobes",
        location: "Hål 2",
        teamId: null,
        drink: "IPA"
      },
      {
        id: crypto.randomUUID(),
        name: "Far i hatten",
        location: "Hål 3",
        teamId: null,
        drink: "Valfritt"
      },
      {
        id: crypto.randomUUID(),
        name: "Mikkeller",
        location: "Hål 4",
        teamId: null,
        drink: "APA"
      },
      {
        id: crypto.randomUUID(),
        name: "TapRoom",
        location: "Hål 5",
        teamId: null,
        drink: "Sour"
      },
      {
        id: crypto.randomUUID(),
        name: "Kröl",
        location: "Hål 6",
        teamId: null,
        drink: "Pilsner"
      },
      {
        id: crypto.randomUUID(),
        name: "Nyhavn",
        location: "Hål 7",
        teamId: null,
        drink: "Hoegaarden"
      },
      {
        id: crypto.randomUUID(),
        name: "Pivo",
        location: "Hål 8",
        teamId: null,
        drink: "Utnetiecke"
      },
      {
        id: crypto.randomUUID(),
        name: "Opopoppa",
        location: "Hål 9",
        teamId: null,
        drink: "Baren tipsar"
      }
    ];

    const newGame: Game = {
      id: gameId,
      date: new Date().toISOString(),
      teams: defaultTeams,
      matches: [],
      bars: defaultBars,
      status: 'pending',
      currentRound: 1
    };

    try {
      await set(ref(database, `games/${gameId}`), newGame);
      setCurrentGame(newGame);
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

  const startGame = async () => {
    if (!currentGame || currentGame.teams.length < 2) return;
    
    const gameRef = ref(database, `games/${currentGame.id}`);
    
    // Använd antalet barer som användaren har skapat
    const matches = generateFixedMatches(currentGame.teams, currentGame.bars);
    
    await update(gameRef, { 
      status: 'active',
      matches,
      bars: currentGame.bars,
      currentRound: 1
    });
    
    // Omdirigera till spelsidan
    router.push(`/game/${currentGame.id}`);
  };

  const joinGame = async (gameId: string) => {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentGame({
          ...data,
          date: new Date(data.date)
        });
      }
    });
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