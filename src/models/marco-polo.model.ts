import { Member } from "@/models/member.model";
export class MarcoPoloPlayer {
  constructor(
    public user: Member | undefined,
    public character: string,
    public points: number | undefined,
    public placement: number | undefined,
    public startPosition: number | undefined
  ) {}
}

export class MarcoPoloGame {
  constructor(
    public players: MarcoPoloPlayer[],
    public time: number,
    public location: string
  ) {}
}
