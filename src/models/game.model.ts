import { Player } from "./player.model";

// Base class for all games
export interface Game {
  players: Player[];
  time: number;
  location: string;
  season: number;
  map?: string; // optional when multiple maps are available
  timePlayed?: number;
}
