import { Player } from "./player.model";
import { Game } from "./game.model";
import { Member } from "@/models/member.model";
export class WingspanPlayer implements Player {
  constructor(
    public user: Member,
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
    public season: number
  ) {}
}
