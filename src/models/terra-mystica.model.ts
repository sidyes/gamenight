import { Game } from "./game.model";
import { PlayerElo } from "./player-elo.model";
import { Player } from "./player.model";

export class TerraMysticaPlayer implements Player {
  constructor(
    public user: PlayerElo,
    public placement: number,
    public faction: string,
    public gamePoints: number,
    public area: number,
    public cult: number,
    public resources: number,
    public points: number
  ) {}
}

export class TerraMysticaGame implements Game {
  constructor(
    public players: TerraMysticaPlayer[],
    public time: number,
    public location: string,
    public season: number,
    public map: string,
    public timePlayed: number
  ) {}
}
