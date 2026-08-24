import { Team, Bar, Match } from '@/types/game';

export function generateMatches(teams: Team[], bars: Bar[], rounds?: number): Match[] {
  if (teams.length < 2 || bars.length === 0) return [];

  const totalRounds = rounds && rounds > 0 ? rounds : bars.length;
  const matches: Match[] = [];

  // Skapa en kopia av lagen för att hålla reda på vilka som spelat mot varandra
  const teamHistory: { [key: string]: string[] } = {};
  teams.forEach(team => {
    teamHistory[team.id] = [];
  });

  // För varje runda
  for (let round = 1; round <= totalRounds; round++) {
    const bar = bars[(round - 1) % bars.length];
    const availableTeams = [...teams];
    let matchNumber = 1;

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
        matchNumber: matchNumber++,
        team1Id: team1.id,
        team2Id: bestOpponent.id,
        barId: bar.id,
        scores: []
      });

      // Uppdatera historiken
      teamHistory[team1.id].push(bestOpponent.id);
      teamHistory[bestOpponent.id].push(team1.id);
    }
  }

  return matches;
}
