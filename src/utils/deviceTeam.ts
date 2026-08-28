const PREFIX = 'pubgolf_team_';

export function getDeviceTeamId(gameId: string): string | null {
  return localStorage.getItem(PREFIX + gameId);
}

export function setDeviceTeamId(gameId: string, teamId: string): void {
  localStorage.setItem(PREFIX + gameId, teamId);
}

export function clearDeviceTeamId(gameId: string): void {
  localStorage.removeItem(PREFIX + gameId);
}
