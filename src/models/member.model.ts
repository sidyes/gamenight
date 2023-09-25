type Elo = {
  arkNova: number;
  terraMystica: number;
  challengers: number;
  wingspan: number;
  marcoPolo: number;
};

export class Member {
  elo: Elo = {
    arkNova: 100,
    terraMystica: 100,
    challengers: 100,
    wingspan: 100,
    marcoPolo: 100,
  };

  constructor(
    public username: string,
    public email: string,
    public isAdmin: boolean,
    elo?: Elo
  ) {
    if (elo) {
      this.elo = elo;
    }
  }
}
