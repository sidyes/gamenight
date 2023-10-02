import { Game, PlayerElo } from "@/models";

// algorithm from https://www.youtube.com/watch?v=on1Qvnuug2c
export const calculateElo = (game: Game, allGames: Game[]) => {
  const result: PlayerElo[] = [];

  game.players.forEach((player) => {
    const currentElo = +player.user.elo;

    let totalReward = 0;

    const otherPlayers = game.players.filter(
      (pl) => pl.user.email != player.user.email
    );

    otherPlayers.forEach((opponent) => {
      let reward = 0;
      const chanceOfWinning =
        currentElo / (+opponent.user.elo + currentElo) || 0; // if both have their first game, it is unpredicable => 0 is taken

      if (player.placement < opponent.placement) {
        reward = 1 - chanceOfWinning; // win
      } else if (player.placement === opponent.placement) {
        reward = 0.5 - chanceOfWinning; // draw
      } else {
        reward = 0 - chanceOfWinning; // loss
      }

      const kFactor = getKFactor(allGames, player.user.email);

      const adjustedReward = reward * kFactor;

      totalReward += adjustedReward;
    });

    // player variance is ignored -> weight of points will not consider number of players for now
    let calculatedElo = currentElo + totalReward;

    if (currentElo === 0 && calculatedElo < 1) {
      // after first game at least elo of 1
      calculatedElo = 1;
    } else if (currentElo >= 100 && calculatedElo < 100) {
      // cant get below 100 if you already reached that threshold
      calculatedElo = 100;
    }

    result.push(
      new PlayerElo(player.user.username, player.user.email, calculatedElo)
    );
  });

  return result;
};

const getKFactor = (games: Game[], email: string) => {
  const nrOfGames = games.filter((game) =>
    game.players.some((player) => player.user.email === email)
  ).length;

  if (nrOfGames <= 10) {
    return 60;
  } else if (nrOfGames <= 20) {
    return 40;
  } else {
    return 20;
  }
};
