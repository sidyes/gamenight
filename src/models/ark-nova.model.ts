import { Player } from "./player.model";
import { Game } from "./game.model";

export class ArkNovaPlayer implements Player {
  constructor(
    public username: string,
    public placement: number,
    public elo: number,
    public points: number,
    public appealPoints: number, // Attraktion
    public appealPointsCompare: number,
    public conservationPoints: number, // Artenschutz
    public startPosition: number,
    public zooMapFull: boolean,
    public zooMap: string
  ) {}
}

export class ArkNovaGame implements Game {
  constructor(
    public players: ArkNovaPlayer[],
    public time: number,
    public location: string,
    public season: number,
    public timePlayed: number
  ) {}
}
