const getKFactor = (games, email) => {
  const nrOfGames = games.filter((game) =>
    game.players.some((player) => player.user.email === email)
  ).length;

  if (nrOfGames <= 5) {
    return 32;
  } else {
    return 20;
  }
};

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);

  const game = data.game;
  const allGames = data.allGames;

  const result = [];

  game.players.forEach((player) => {
    const currentElo = +player.user.elo;

    let totalChanceOfWinning = 0;

    const otherPlayers = game.players.filter(
      (pl) => pl.user.email != player.user.email
    );

    const kFactor = getKFactor(allGames, player.user.email);

    otherPlayers.forEach((opponent) => {
      const opponentElo = +opponent.user.elo || 0;

      const chanceOfWinning =
        1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));

      const score =
        player.placement < opponent.placement
          ? 1 // win
          : player.placement === opponent.placement
          ? 0.5 // draw
          : 0; // loss

      totalChanceOfWinning += chanceOfWinning;
    });

    const n = game.players.length;
    const numberOfGames = (n * (n - 1)) / 2;
    const estimatedScore = totalChanceOfWinning / numberOfGames;
    const scoringFunction = (n - +player.placement) / numberOfGames;

    let calculatedElo = Math.round(
      currentElo + kFactor * (scoringFunction - estimatedScore)
    );

    if (calculatedElo < 1) {
      // cant be below 1
      calculatedElo = 1;
    } else if (currentElo >= 100 && calculatedElo < 100) {
      // cant get below 100 if you already reached that threshold
      calculatedElo = 100;
    }

    result.push({
      username: player.user.username,
      email: player.user.email,
      elo: calculatedElo,
    });
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
