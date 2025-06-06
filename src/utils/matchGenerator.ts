import { Team } from '@/types/game';

export function generateMatches(teams: Team[], rounds: number): Array<{
  id: string;
  round: number;
  team1Id: string;
  team2Id: string;
  scores: any[];
}> {
  if (teams.length < 2) return [];

  const matches: Array<{
    id: string;
    round: number;
    team1Id: string;
    team2Id: string;
    scores: any[];
  }> = [];

  // Skapa en kopia av lagen för att hålla reda på vilka som spelat mot varandra
  const teamHistory: { [key: string]: string[] } = {};
  teams.forEach(team => {
    teamHistory[team.id] = [];
  });

  // För varje runda
  for (let round = 1; round <= rounds; round++) {
    const availableTeams = [...teams];
    const roundMatches: string[] = [];

    // Medan det finns tillgängliga lag
    while (availableTeams.length >= 2) {
      // Ta första laget
      const team1 = availableTeams[0];
      availableTeams.splice(0, 1);

      // Hitta bästa motståndaren
      let bestOpponent = availableTeams[0];
      let bestOpponentIndex = 0;
      let minRecentMatches = Infinity;

      for (let i = 0; i < availableTeams.length; i++) {
        const opponent = availableTeams[i];
        const recentMatches = teamHistory[team1.id].filter(id => id === opponent.id).length;
        
        if (recentMatches < minRecentMatches) {
          minRecentMatches = recentMatches;
          bestOpponent = opponent;
          bestOpponentIndex = i;
        }
      }

      // Ta bort vald motståndare från tillgängliga lag
      availableTeams.splice(bestOpponentIndex, 1);

      // Skapa matchen
      matches.push({
        id: crypto.randomUUID(),
        round,
        team1Id: team1.id,
        team2Id: bestOpponent.id,
        scores: []
      });

      // Uppdatera historiken
      teamHistory[team1.id].push(bestOpponent.id);
      teamHistory[bestOpponent.id].push(team1.id);
    }
  }

  return matches;
} 