import { StackedColumChartData } from "./../../models/stacked-column-chart-data.model";
import { ResultTableEntry } from "./../../models/result-table-entry.model";
import { WingspanGame, WingspanPlayer } from "@/models/wingspan.model";
import { GetterTree, MutationTree, ActionTree } from "vuex";
import {
  GameSummaryItem,
  TableHeading,
  AllTimeTableEntry,
  GameScoreItem,
  WinDistribution,
  AverageScores,
  Series
} from "@/models";

const axios = require("axios");

interface WingspanState {
  games: WingspanGame[];
  gamesLoaded: boolean;
  allTimeTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  resultTableHeadings: TableHeading[];
}

const state: WingspanState = {
  games: [],
  gamesLoaded: false,
  allTimeTableHeadings: [
    new TableHeading("Spieler", "username"),
    new TableHeading("Spiele", "games"),
    new TableHeading("🥇", "wins"),
    new TableHeading("🥈", "secondPlaces"),
    new TableHeading("🥉", "thirdPlaces"),
    new TableHeading("Punkte", "points")
  ],
  summaryHeadings: ["Spiele", "Siege", "Siegquote (%)", "Ø Punkte"],
  gameScoresHeadings: [
    "Top Score",
    "Highest Losing Score",
    "Avg Score",
    "Lowest Win Score",
    "Lowest Score"
  ],
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Spieler", "players"),
    new TableHeading("Ø Punkte", "avg"),
    new TableHeading("Gewinner (Punkte)", "winner")
  ]
};

const getters: GetterTree<WingspanState, any> = {
  getGamesLoaded: state => state.gamesLoaded,
  getAllTimeTable: state => {
    const allTimeEntries: AllTimeTableEntry[] = [];

    state.games.map(game => {
      game.players.forEach(player => {
        let entry = allTimeEntries.find(
          elem => elem.username === player.user.username
        );

        if (!entry) {
          entry = new AllTimeTableEntry(
            player.user.username,
            state.games.length,
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
  },
  getAllTimeTableHeadings: state => state.allTimeTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];
    const games = new GameSummaryItem(
      state.summaryHeadings[0],
      state.games.length.toString()
    );

    const wins = new GameSummaryItem(
      state.summaryHeadings[1],
      state.games
        .map(game => {
          const winner = game.players.find(pl => pl.placement === 1);
          return winner ? winner.user.username : "";
        })
        .filter(winner => user && winner === user.username)
        .length.toString()
    );

    const winPercentage = new GameSummaryItem(
      state.summaryHeadings[2],
      `${+(+wins.value / state.games.length).toFixed(2) * 100 || 0} %`
    );

    const avgPoints = (
      (state.games
        .map(game => {
          const player = game.players.find(
            pl => user && pl.user.email === user.email
          );
          return player ? player.points : 0;
        })
        .reduce((a, b) => {
          return +a + +b;
        }, 0) || 0) / state.games.length
    ).toFixed(2);

    const avg = new GameSummaryItem(
      state.summaryHeadings[3],
      isNaN(+avgPoints) ? "0" : avgPoints
    );

    return [games, wins, winPercentage, avg];
  },
  getGameScores: (state): GameScoreItem[] => {
    const topScore = new GameScoreItem(state.gameScoresHeadings[0], 0, "");
    const highestLosingScore = new GameScoreItem(
      state.gameScoresHeadings[1],
      0,
      ""
    );
    const avgScore = new GameScoreItem(state.gameScoresHeadings[2], 0, "");
    const lowestWinScore = new GameScoreItem(
      state.gameScoresHeadings[3],
      0,
      ""
    );
    const lowestScore = new GameScoreItem(state.gameScoresHeadings[4], 0, "");

    let avg = 0;

    state.games.forEach(game => {
      let avgGame = 0;

      game.players.forEach(player => {
        const points = player.points;
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

    if (state.games.length) {
      avgScore.count = +(avg / state.games.length).toFixed(2);
    }

    return [
      topScore,
      highestLosingScore,
      avgScore,
      lowestWinScore,
      lowestScore
    ];
  },
  getWinDistributionPlayer: state => {
    let players: string[] = [];
    let wins: number[] = [];

    state.games.forEach(game => {
      game.players.forEach(player => {
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

    wins = wins.map(win => +((win / state.games.length) * 100).toFixed(1));

    if (wins.length === 0) {
      wins.push(1);
    }

    return new WinDistribution(players, wins);
  },
  getAverageScores: state => {
    const average: AverageScores = new AverageScores([], 0);

    state.games.forEach(game => {
      let gameAverage = 0;
      game.players.forEach(player => {
        const user = average.players.find(
          el => el.username === player.user.username
        );

        const points = player.points;

        if (!user) {
          average.players.push({
            username: player.user.username,
            average: points,
            games: 1
          });
        } else {
          user.average = +user.average + points;
          user.games++;
        }

        gameAverage = +gameAverage + points;
      });

      gameAverage = gameAverage / game.players.length;
      average.totalAverage = +average.totalAverage + +gameAverage;
    });

    average.totalAverage = +(
      +average.totalAverage / state.games.length
    ).toFixed(2);
    average.players.forEach(pl => {
      pl.average = +(pl.average / pl.games).toFixed(2);
    });

    return average;
  },
  getAveragePointsDistribution: (state): StackedColumChartData => {
    let players: string[] = [];
    let games: number[] = [];
    const birds = new Series("Vögel", []);
    const bonusCards = new Series("Bonuskarten", []);
    const endOfRoundGoals = new Series("Rundenziele", []);
    const eggs = new Series("Eier", []);
    const foodOnCards = new Series("Gelagertes Futter", []);
    const tuckedCards = new Series("Karten unter Vögeln", []);

    state.games.forEach(game => {
      game.players.forEach(player => {
        let idx = players.indexOf(player.user.username);

        if (idx === -1) {
          players.push(player.user.username);
          games.push(1);
          birds.data.push(player.birds.toString());
          bonusCards.data.push(player.bonusCards.toString());
          endOfRoundGoals.data.push(player.endOfRoundGoals.toString());
          eggs.data.push(player.eggs.toString());
          foodOnCards.data.push(player.foodOnCards.toString());
          tuckedCards.data.push(player.tuckedCards.toString());
        } else {
          birds.data[idx] = (+birds.data[idx] + +player.birds).toString();
          bonusCards.data[idx] = (
            +bonusCards.data[idx] + +player.bonusCards
          ).toString();
          endOfRoundGoals.data[idx] = (
            +endOfRoundGoals.data[idx] + +player.endOfRoundGoals
          ).toString();
          eggs.data[idx] = (+eggs.data[idx] + +player.eggs).toString();
          foodOnCards.data[idx] = (
            +foodOnCards.data[idx] + +player.foodOnCards
          ).toString();
          tuckedCards.data[idx] = (
            +tuckedCards.data[idx] + +player.tuckedCards
          ).toString();
          games[idx] = +games[idx] + 1;
        }
      });
    });

    birds.data = birds.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    bonusCards.data = bonusCards.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    endOfRoundGoals.data = endOfRoundGoals.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    eggs.data = eggs.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    foodOnCards.data = foodOnCards.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    tuckedCards.data = tuckedCards.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );

    return {
      categories: players,
      series: [
        birds,
        bonusCards,
        endOfRoundGoals,
        eggs,
        foodOnCards,
        tuckedCards
      ]
    };
  },
  getGamesLastYear: state => {
    const today = new Date();
    const monthBuckets = Array.apply(null, Array(12)).map(() => 0);

    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

      state.games.forEach(game => {
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
        monthBuckets.map(x => x.toString())
      )
    ];
  },
  getResultTable: state =>
    state.games
      .map(game => {
        const date = new Date(game.time).toDateString();

        const players = game.players
          .map(user => (user.user ? user.user.username : ""))
          .join(", ");
        const location = game.location;
        const playerWon = game.players.find(pl => pl.placement === 1);
        let winner = playerWon
          ? `${playerWon.user.username} (${playerWon.points})`
          : "-";

        const avg = (
          game.players.map(pl => pl.points).reduce((a, b) => a + b) /
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
      }),
  getResultTableHeadings: state => state.resultTableHeadings
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

const mutations: MutationTree<WingspanState> = {
  setGames: (state, games: WingspanGame[]) => {
    games.forEach(game =>
      game.players.sort((a, b) => (a.placement < b.placement ? -1 : 1))
    );
    state.games = games;
    state.gamesLoaded = true;
  },
  reset: state => {
    state.games = [];
    state.gamesLoaded = false;
  }
};

const actions: ActionTree<WingspanState, any> = {
  fetchGames: ({ commit }, payload) => {
    axios
      .get("/.netlify/functions/wingspan-read", { params: payload })
      .then((response: any) => {
        commit("setGames", response.data.items);
      });
  }
};

export const wingspan = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
