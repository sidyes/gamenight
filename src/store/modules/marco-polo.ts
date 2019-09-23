import { WinDistribution } from "@/models/win-distribution.model";
import { GameScoreItem } from "@/models/game-score-item.model";
import { ResultTableHeading } from "@/models/result-table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { MarcoPoloGame, MarcoPoloPlayer } from "@/models/marco-polo.model";
import { Series } from "@/models/series.model";
const axios = require("axios");

interface MarcoPoloState {
  resultTableHeadings: ResultTableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  games: MarcoPoloGame[];
  characters: string[];
}

const state: MarcoPoloState = {
  resultTableHeadings: [
    new ResultTableHeading("Date", "date"),
    new ResultTableHeading("Location", "location"),
    new ResultTableHeading("Players (Start Position)", "players"),
    new ResultTableHeading("Winner (Points)", "winner")
  ],
  summaryHeadings: ["Games", "Wins", "Win Percentage", "Avg Points"],
  gameScoresHeadings: [
    "Top Score",
    "Highest Losing Score",
    "Avg Score",
    "Lowest Win Score",
    "Lowest Score"
  ],
  games: [],
  characters: [
    "Berke Khan",
    "Johannes Caprini",
    "Kubilai Khan",
    "Matteo Polo",
    "Mercator ex Tabriz",
    "Niccolo und Marco Polo",
    "Wilhelm von Rubruk"
  ]
};

const getters: GetterTree<MarcoPoloState, any> = {
  getResultTable: state =>
    state.games.map(game => {
      const date = new Date(game.time).toDateString();
      const players = game.players
        .map(user => (user.user ? user.user.username : ""))
        .join(", ");
      const location = game.location;
      let winner = getWinner(game, true);

      return {
        date,
        players,
        location,
        winner
      };
    }),
  getResultTableHeadings: state => state.resultTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];
    const games = new GameSummaryItem(
      state.summaryHeadings[0],
      state.games.length.toString()
    );

    const wins = new GameSummaryItem(
      state.summaryHeadings[1],
      state.games
        .map(game => getWinner(game, false))
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
  getCharacters: state => state.characters,
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
    let highestLosePlayer: MarcoPoloPlayer = undefined as any;

    state.games.forEach(game => {
      let avgGame = 0;

      game.players.forEach(player => {
        // top score
        if (+player.points > topScore.count) {
          topScore.count = +player.points;
          topScore.player = player.user.username;
        }

        // lowest win score
        if (
          getWinner(game, false) === player.user.username &&
          (+player.points < lowestWinScore.count || lowestWinScore.count === 0)
        ) {
          lowestWinScore.count = +player.points;
          lowestWinScore.player = player.user.username;
        }

        // lowest score
        if (+player.points < lowestScore.count || lowestScore.count === 0) {
          lowestScore.count = +player.points;
          lowestScore.player = player.user.username;
        }

        if (
          !highestLosePlayer ||
          (player.placement === game.players.length &&
            player.points > highestLosingScore.count)
        ) {
          highestLosePlayer = player;
        }

        avgGame += +player.points;
      });

      avg += +(avgGame / game.players.length);
    });

    if (state.games.length) {
      avgScore.count = +(avg / state.games.length).toFixed(2);

      highestLosingScore.count = highestLosePlayer.points;
      highestLosingScore.player = highestLosePlayer.user.username;
    }

    return [
      topScore,
      highestLosingScore,
      avgScore,
      lowestWinScore,
      lowestScore
    ];
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

    return [new Series("Played", monthBuckets.map(x => x.toString()))];
  },
  getWinDistribution: state => {
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

        if (getWinner(game, false) === player.user.username) {
          wins[idx] += 1;
        }
      });
    });

    wins = wins.map(win => +((win / state.games.length) * 100).toFixed(1));

    if (wins.length === 0) {
      wins.push(1);
    }

    return new WinDistribution(players, wins);
  }
};

//Mutations Must Be Synchronous
const mutations: MutationTree<MarcoPoloState> = {
  setGames: (state, games: MarcoPoloGame[]) => {
    state.games = games;
  },
  reset: state => {
    state.games = [];
  }
};

const actions: ActionTree<MarcoPoloState, any> = {
  fetchGames: ({ commit }, payload) => {
    axios
      .get("/.netlify/functions/marco-polo-read", { params: payload })
      .then((response: any) => {
        commit("setGames", response.data.items);
      });
  }
};

function getWinner(game: MarcoPoloGame, includeHighscore: boolean): any {
  let winner = "";
  let highscore = 0;

  game.players.forEach(player => {
    if (player.points && player.user && player.points > highscore) {
      highscore = player.points;
      winner = winner = includeHighscore
        ? `${player.user.username} (${highscore})`
        : `${player.user.username}`;
    }
  });

  return winner;
}

export const marcoPolo = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
