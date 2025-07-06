import { Player } from "./player.model";
import { Game } from "./game.model";

export class MarcoPoloPlayer implements Player {
  constructor(
    public username: string,
    public elo: number,
    public placement: number,
    public character: string,
    public points: number,
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
