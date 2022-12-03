import { Player } from "./player.model";
import { Member } from "@/models/member.model";
import { Game } from "./game.model";
export class MarcoPoloPlayer implements Player {
  constructor(
    public user: Member,
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
