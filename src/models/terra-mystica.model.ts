import { Game } from "./game.model";
import { Player } from "./player.model";
import { Member } from "@/models/member.model";

export class TerraMysticaPlayer implements Player {
  constructor(
    public user: Member,
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
