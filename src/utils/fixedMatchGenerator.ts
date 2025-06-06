import { Team, Bar, Match } from '@/types/game';

export function generateFixedMatches(teams: Team[], bars: Bar[]): Match[] {
  const teamId = (name: string) => teams.find(t => t.name === name)?.id || '';
  const barId = (name: string) => bars.find(b => b.name === name)?.id || '';

  return [
    { round: 1, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('BullBear'), barId: barId('Ölkafeet'), scores: [], id: crypto.randomUUID() },
    { round: 1, matchNumber: 2, team1Id: teamId('Tjänstebil'), team2Id: teamId('Nordöst'), barId: barId('Ölkafeet'), scores: [], id: crypto.randomUUID() },
    { round: 2, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('BullBear'), barId: barId('Old Nobes'), scores: [], id: crypto.randomUUID() },
    { round: 2, matchNumber: 2, team1Id: teamId('Tjänstebil'), team2Id: teamId('Nordöst'), barId: barId('Far i hatten'), scores: [], id: crypto.randomUUID() },
    { round: 3, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('Tjänstebil'), barId: barId('Kröl'), scores: [], id: crypto.randomUUID() },
    { round: 3, matchNumber: 2, team1Id: teamId('Nordöst'), team2Id: teamId('BullBear'), barId: barId('Pivo'), scores: [], id: crypto.randomUUID() },
    { round: 4, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('Nordöst'), barId: barId('Nyhavn'), scores: [], id: crypto.randomUUID() },
    { round: 4, matchNumber: 2, team1Id: teamId('BullBear'), team2Id: teamId('Tjänstebil'), barId: barId('Opopoppa'), scores: [], id: crypto.randomUUID() },
    { round: 5, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('BullBear'), barId: barId('Mikkeller'), scores: [], id: crypto.randomUUID() },
    { round: 5, matchNumber: 2, team1Id: teamId('Tjänstebil'), team2Id: teamId('Nordöst'), barId: barId('Mikkeller'), scores: [], id: crypto.randomUUID() },
    { round: 6, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('BullBear'), barId: barId('Far i hatten'), scores: [], id: crypto.randomUUID() },
    { round: 6, matchNumber: 2, team1Id: teamId('Tjänstebil'), team2Id: teamId('Nordöst'), barId: barId('Old Nobes'), scores: [], id: crypto.randomUUID() },
    { round: 7, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('Tjänstebil'), barId: barId('Pivo'), scores: [], id: crypto.randomUUID() },
    { round: 7, matchNumber: 2, team1Id: teamId('Nordöst'), team2Id: teamId('BullBear'), barId: barId('Kröl'), scores: [], id: crypto.randomUUID() },
    { round: 8, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('Nordöst'), barId: barId('Opopoppa'), scores: [], id: crypto.randomUUID() },
    { round: 8, matchNumber: 2, team1Id: teamId('BullBear'), team2Id: teamId('Tjänstebil'), barId: barId('Nyhavn'), scores: [], id: crypto.randomUUID() },
    { round: 9, matchNumber: 1, team1Id: teamId('Karamellkungarna'), team2Id: teamId('BullBear'), barId: barId('TapRoom'), scores: [], id: crypto.randomUUID() },
    { round: 9, matchNumber: 2, team1Id: teamId('Tjänstebil'), team2Id: teamId('Nordöst'), barId: barId('TapRoom'), scores: [], id: crypto.randomUUID() },
  ];
} 