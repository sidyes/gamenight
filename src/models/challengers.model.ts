import { Player } from "./player.model";
import { Game } from "./game.model";
import { Member } from "@/models/member.model";
export class ChallengersPlayer implements Player {
  constructor(
    public user: Member,
    public placement: number,
    public points: number, // === fans
    public trophies: number
  ) {}
}

export class ChallengersGame implements Game {
  constructor(
    public players: ChallengersPlayer[],
    public time: number,
    public location: string,
    public season: number,
    public timePlayed: number
  ) {}
}
