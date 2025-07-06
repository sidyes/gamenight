// Base class for all specific game players
export interface Player {
  username: string;
  placement: number;
  points: number;
  elo: number;
}
