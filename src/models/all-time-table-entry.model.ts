export class AllTimeTableEntry {
  constructor(
    public username: string,
    public elo: number,
    public games: number,
    public wins: number,
    public secondPlaces: number,
    public thirdPlaces: number,
    public points: number
  ) {}
}
