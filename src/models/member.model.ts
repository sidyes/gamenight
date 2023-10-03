type Elo = {
  arkNova: number;
  terraMystica: number;
  challengers: number;
  wingspan: number;
  marcoPolo: number;
};

export class Member {
  elo: Elo = {
    arkNova: 0,
    terraMystica: 0,
    challengers: 0,
    wingspan: 0,
    marcoPolo: 0,
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
