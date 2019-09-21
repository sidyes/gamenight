import { Member } from "@/models/member.model";
export class MarcoPoloPlayer {
  constructor(
    public user: Member,
    public character: string,
    public points: number,
    public placement: number,
    public startPosition: number
  ) {}
}

export class MarcoPoloGame {
  constructor(
    public players: MarcoPoloPlayer[],
    public time: number,
    public location: string
  ) {}
}
