import { Member } from "@/models/member.model";
import { Game } from "./../models/game.model";
import {
  AllTimeTableEntry,
  ResultTableEntry,
  GameSummaryItem,
  GameScoreItem,
  WinDistribution,
  AverageScores,
  Series,
} from "@/models";

export const getAllTimeTable = (games: Game[]) => {
  const allTimeEntries: AllTimeTableEntry[] = [];

  games.map((game) => {
    game.players.forEach((player) => {
      let entry = allTimeEntries.find(
        (elem) => elem.username === player.user.username
      );

      if (!entry) {
        entry = new AllTimeTableEntry(
          player.user.username,
          games.length,
          0,
          0,
          0,
          0
        );
        allTimeEntries.push(entry);
      }

      switch (player.placement) {
        case 1: {
          entry.wins++;
          entry.points += 5;
          break;
        }
        case 2: {
          entry.secondPlaces++;
          entry.points += 3;
          break;
        }
        case 3: {
          entry.points += 2;
          entry.thirdPlaces++;
          break;
        }
        default: {
          entry.points++;
          break;
        }
      }
    });
  });

  allTimeEntries.sort(compareAllTimeTableEntries);

  return allTimeEntries;
};

function compareAllTimeTableEntries(
  a: AllTimeTableEntry,
  b: AllTimeTableEntry
): number {
  if (a.points < b.points) {
    return 1;
  }
  if (a.points > b.points) {
    return -1;
  }

  if (a.wins < b.wins) {
    return 1;
  }
  if (a.wins > b.wins) {
    return -1;
  }

  if (a.secondPlaces < b.secondPlaces) {
    return 1;
  }
  if (a.secondPlaces > b.secondPlaces) {
    return -1;
  }

  if (a.thirdPlaces < b.thirdPlaces) {
    return 1;
  }
  if (a.thirdPlaces > b.thirdPlaces) {
    return -1;
  }

  return 0;
}

export const getResultTable = (games: Game[]) => {
  return games
    .map((game) => {
      const date = new Date(game.time).toDateString();

      const players = game.players
        .map((user) => (user.user ? user.user.username : ""))
        .join(", ");
      const location = game.location;
      const playerWon = game.players.find((pl) => pl.placement === 1);
      let winner = playerWon
        ? `${playerWon.user.username} (${playerWon.points})`
        : "-";

      const avg = (
        game.players.map((pl) => pl.points).reduce((a, b) => +a + +b) /
        game.players.length
      ).toFixed(0);

      return new ResultTableEntry(
        game.time,
        date,
        players,
        location,
        winner,
        avg
      );
    })
    .sort((a, b) => {
      return a.id > b.id ? -1 : 1;
    });
};

export const getSummary = (headings: string[], games: Game[], user: Member) => {
  const game = new GameSummaryItem(headings[0], games.length.toString());

  const wins = new GameSummaryItem(
    headings[1],
    games
      .map((game) => {
        const winner = game.players.find((pl) => pl.placement === 1);
        return winner ? winner.user.username : "";
      })
      .filter((winner) => user && winner === user.username)
      .length.toString()
  );

  const winPercentage = new GameSummaryItem(
    headings[2],
    `${+(+wins.value / games.length).toFixed(2) * 100 || 0} %`
  );

  const avgPoints = (
    (games
      .map((game) => {
        const player = game.players.find(
          (pl) => user && pl.user.email === user.email
        );
        return player ? player.points : 0;
      })
      .reduce((a, b) => {
        return +a + +b;
      }, 0) || 0) / games.length
  ).toFixed(2);

  const avg = new GameSummaryItem(
    headings[3],
    isNaN(+avgPoints) ? "0" : avgPoints
  );

  return [game, wins, winPercentage, avg];
};

export const getGameScores = (headings: string[], games: Game[]) => {
  const topScore = new GameScoreItem(headings[0], 0, "");
  const highestLosingScore = new GameScoreItem(headings[1], 0, "");
  const avgScore = new GameScoreItem(headings[2], 0, "");
  const lowestWinScore = new GameScoreItem(headings[3], 0, "");
  const lowestScore = new GameScoreItem(headings[4], 0, "");

  let avg = 0;

  games.forEach((game) => {
    let avgGame = 0;

    game.players.forEach((player) => {
      const points = +player.points;

      // top score
      if (points > topScore.count) {
        topScore.count = points;
        topScore.player = player.user.username;
      }

      // lowest win score
      if (
        player.placement === 1 &&
        (points < lowestWinScore.count || lowestWinScore.count === 0)
      ) {
        lowestWinScore.count = points;
        lowestWinScore.player = player.user.username;
      }

      // lowest score
      if (points < lowestScore.count || lowestScore.count === 0) {
        lowestScore.count = points;
        lowestScore.player = player.user.username;
      }

      // highest lose score
      if (
        player.placement === game.players.length &&
        points > highestLosingScore.count
      ) {
        highestLosingScore.player = player.user.username;
        highestLosingScore.count = points;
      }

      avgGame += points;
    });

    avg += +(avgGame / game.players.length);
  });

  if (games.length) {
    avgScore.count = +(avg / games.length).toFixed(2);
  }

  return [topScore, highestLosingScore, avgScore, lowestWinScore, lowestScore];
};

export const getWinDistributionPlayer = (games: Game[]) => {
  let players: string[] = [];
  let wins: number[] = [];

  games.forEach((game) => {
    game.players.forEach((player) => {
      let idx = players.indexOf(player.user.username);

      if (idx === -1) {
        players.push(player.user.username);
        idx = players.length - 1;
        wins.push(0);
      }

      if (player.placement === 1) {
        wins[idx] += 1;
      }
    });
  });

  if (wins.length === 0) {
    wins.push(1);
  }

  return new WinDistribution(players, wins);
};

export const getAverageScores = (games: Game[]) => {
  const average: AverageScores = new AverageScores([], 0);

  games.forEach((game) => {
    let gameAverage = 0;
    game.players.forEach((player) => {
      const user = average.players.find(
        (el) => el.username === player.user.username
      );

      if (!user) {
        average.players.push({
          username: player.user.username,
          average: player.points,
          games: 1,
        });
      } else {
        user.average = +user.average + +player.points;
        user.games++;
      }

      gameAverage = +gameAverage + +player.points;
    });

    gameAverage = gameAverage / game.players.length;
    average.totalAverage = +average.totalAverage + +gameAverage;
  });

  average.totalAverage = +(+average.totalAverage / games.length).toFixed(2);
  average.players.forEach((pl) => {
    pl.average = +(pl.average / pl.games).toFixed(2);
  });

  return average;
};

export const getGamesLastYear = (games: Game[]) => {
  const today = new Date();
  const monthBuckets = Array.apply(null, Array(12)).map(() => 0);

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

    games.forEach((game) => {
      const gameTime = new Date(game.time);
      if (
        gameTime.getFullYear() === d.getFullYear() &&
        gameTime.getMonth() === d.getMonth()
      ) {
        monthBuckets[11 - i] += 1;
      }
    });
  }

  return [
    new Series(
      "Gespielt",
      monthBuckets.map((x) => x.toString())
    ),
  ];
};

export const getGamesForSeason = (season: number, games: Game[]) =>
  games.filter((game) => game.season === season || season === -1);
