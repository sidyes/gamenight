import { Player } from "./player.model";
import { Game } from "./game.model";
import { PlayerElo } from "./player-elo.model";
export class MarcoPoloPlayer implements Player {
  constructor(
    public user: PlayerElo,
    public character: string,
    public points: number,
    public placement: number,
    public startPosition: number
  ) {}
}

export class MarcoPoloGame implements Game {
  constructor(
    public players: MarcoPoloPlayer[],
    public time: number,
    public location: string,
    public season: number,
    public timePlayed: number
  ) {}
}
