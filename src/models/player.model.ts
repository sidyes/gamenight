import { PlayerElo } from "./player-elo.model";

// Base class for all specific game players
export interface Player {
  user: PlayerElo;
  placement: number;
  points: number;
}
