import { CharacterTableEntry } from "../../models/character-table-entry.model";
import { ResultTableEntry } from "./../../models/result-table-entry.model";
import { AllTimeTableEntry } from "@/models/all-time-table-entry.model";
import { WinDistribution } from "@/models/win-distribution.model";
import { GameScoreItem } from "@/models/game-score-item.model";
import { TableHeading } from "@/models/table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import { } from "axios";
import { MarcoPoloGame } from "@/models/marco-polo.model";
import { Series } from "@/models/series.model";
const axios = require("axios");

interface MarcoPoloState {
  resultTableHeadings: TableHeading[];
  allTimeTableHeadings: TableHeading[];
  characterTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  games: MarcoPoloGame[];
  characters: string[];
}

const state: MarcoPoloState = {
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Spieler (Startposition)", "players"),
    new TableHeading("Ø Punkte", "avg"),
    new TableHeading("Gewinner (Punkte)", "winner")
  ],
  allTimeTableHeadings: [
    new TableHeading("Spieler", "username"),
    new TableHeading("Spiele", "games"),
    new TableHeading("🥇", "wins"),
    new TableHeading("🥈", "secondPlaces"),
    new TableHeading("🥉", "thirdPlaces"),
    new TableHeading("Punkte", "points")
  ],
  characterTableHeadings: [
    new TableHeading("Charakter", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate")
  ],
  summaryHeadings: ["Spiele", "Siege", "Siegquote (%)", "Ø Punkte"],
  gameScoresHeadings: [
    "Top Score",
    "Highest Losing Score",
    "Avg Score",
    "Lowest Win Score",
    "Lowest Score"
  ],
  games: [],
  characters: [
    "Altan Ord",
    "André de Longjumeau",
    "Berke Khan",
    "Fratre Nicolao",
    "Gunj Kököchin",
    "Johannes Caprini",
    "Khan Arghun",
    "Kubilai Khan",
    "Matteo Polo",
    "Mercator ex Tabriz",
    "Niccolo und Marco Polo",
    "Raschi ad-Din Sinan",
    "Wilhelm von Rubruk"
  ]
};

const getters: GetterTree<MarcoPoloState, any> = {
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
  getResultTable: state =>
    state.games.map(game => {
      const date = new Date(game.time).toDateString();
      const players = game.players
        .map(user =>
          user.user ? `${user.user.username} (${user.startPosition})` : ""
        )
        .join(", ");
      const location = game.location;
      const playerWon = game.players.find(pl => pl.placement === 1);
      let winner = playerWon
        ? `${playerWon.user.username} (${playerWon.points})`
        : "-";

      const avg = (
        game.players.map(pl => pl.points).reduce((a, b) => +a + +b) /
        game.players.length
      ).toFixed(0);

      return new ResultTableEntry(date, players, location, winner, avg);
    }),
  getResultTableHeadings: state => state.resultTableHeadings,
  getCharacterTable: (state, getters, _rootState, _rootGetters) => {
    const characters = getters.getCharacters;

    const characterTableEntries: CharacterTableEntry[] = [];
    characters.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0))
    );

    state.games.map(game => {
      game.players.forEach(player => {
        const elem = characterTableEntries.find(
          entry => entry.character === player.character
        );

        if (elem) {
          if (player.placement === 1) {
            ++elem.games;
            ++elem.wins;
            elem.winrate = +(elem.wins / elem.games).toFixed(2) * 100;
          } else {
            ++elem.games;
            elem.winrate = +(elem.wins / elem.games).toFixed(2) * 100;
          }
        }

      });
    });

    characterTableEntries.sort(compareCharacterTableEntries);

    return characterTableEntries;
  },
  getCharacterTableHeadings: state => state.characterTableHeadings,
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
          player.placement === 1 &&
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

        // highest lose score
        if (
          player.placement === game.players.length &&
          player.points > highestLosingScore.count
        ) {
          highestLosingScore.player = player.user.username;
          highestLosingScore.count = +player.points;
        }

        avgGame += +player.points;
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
  getWinDistributionStartPosition: state => {
    let startPositions: string[] = ["1", "2", "3", "4"];
    let wins: number[] = [0, 0, 0, 0];

    state.games.forEach(game => {
      game.players.forEach(player => {
        if (player.placement === 1) {
          wins[player.startPosition - 1]++;
        }
      });
    });

    wins = wins.map(win => +((win / state.games.length) * 100).toFixed(1) || 0);

    if (wins.length === 0) {
      wins.push(1);
    }

    return new WinDistribution(startPositions, wins);
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

function compareCharacterTableEntries(
  a: CharacterTableEntry,
  b: CharacterTableEntry
): number {
  if (a.winrate > b.winrate) {
    return -1;
  }

  if (a.winrate < b.winrate) {
    return 1;
  }

  if (a.winrate === b.winrate) {
    if (a.games > b.games) {
      return -1;
    }

    if (a.games < b.games) {
      return 1;
    }
  }

  return 0;
}

export const marcoPolo = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
