export class AverageScores {
  constructor(
    public players: {
      username: string;
      average: number;
      games: number;
    }[],
    public totalAverage: number
  ) {}
}
