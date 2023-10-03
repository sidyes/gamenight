import { GameCollection } from "./game-collection.enum";
import { GameName } from "./game-name.enum";
import { Game } from "./game.model";

export class CreateGameRequestModel {
  constructor(
    public game: Game,
    public collection: GameCollection,
    public gameName: GameName
  ) {}
}
