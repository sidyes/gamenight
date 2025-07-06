import { Player } from "./player.model";
import { Game } from "./game.model";
export class WingspanPlayer implements Player {
  constructor(
    public username: string,
    public elo: number,
    public placement: number,
    public points: number,
    public birds: number,
    public bonusCards: number,
    public endOfRoundGoals: number,
    public eggs: number,
    public foodOnCards: number,
    public tuckedCards: number
  ) {}
}

export class WingspanGame implements Game {
  constructor(
    public players: WingspanPlayer[],
    public time: number,
    public location: string,
    public season: number,
    public timePlayed: number
  ) {}
}
