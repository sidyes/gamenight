import {
  getAllTimeTable,
  getResultTable,
  getGameScores,
  getSummary,
  getWinDistributionPlayer,
} from "./../shared";
import { TerraMysticaGame } from "./../../models/terra-mystica.model";
import { CharacterTableEntry } from "@/models/character-table-entry.model";
import { GameScoreItem } from "@/models/game-score-item.model";
import { TableHeading } from "@/models/table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { Series } from "@/models/series.model";
import { AverageScores } from "@/models/average-scores.model";
import { StackedColumChartData } from "@/models";

const axios = require("axios");

interface TerraMysticaState {
  resultTableHeadings: TableHeading[];
  allTimeTableHeadings: TableHeading[];
  factionsTableHeadings: TableHeading[];
  myTopFactionsTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  games: TerraMysticaGame[];
  factions: string[];
  gamesLoaded: boolean;
  isLoading: boolean;
  season: number;
}

const state: TerraMysticaState = {
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Spieler", "players"),
    new TableHeading("Ø Punkte", "avg"),
    new TableHeading("Gewinner (Punkte)", "winner"),
  ],
  allTimeTableHeadings: [
    new TableHeading("Spieler", "username"),
    new TableHeading("Spiele", "games"),
    new TableHeading("🥇", "wins"),
    new TableHeading("🥈", "secondPlaces"),
    new TableHeading("🥉", "thirdPlaces"),
    new TableHeading("Punkte", "points"),
  ],
  factionsTableHeadings: [
    new TableHeading("Top Völker", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate"),
    new TableHeading("Erspielte Gesamtpunkte (Ø pro Spiel)", "points"),
  ],
  myTopFactionsTableHeadings: [
    new TableHeading("Meine Top Völker", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate"),
    new TableHeading("Erspielte Gesamtpunkte (Ø pro Spiel)", "points"),
  ],
  summaryHeadings: ["Spiele", "Siege", "Siegquote (%)", "Ø Punkte"],
  gameScoresHeadings: [
    "Top Score",
    "Highest Losing Score",
    "Avg Score",
    "Lowest Win Score",
    "Lowest Score",
  ],
  games: [],
  factions: [
    "Auren",
    "Hexen",
    "Nixen",
    "Schwarmlinge",
    "Alchimisten",
    "Düsterlinge",
    "Chaosmagier",
    "Giganten",
    "Halblinge",
    "Kultisten",
    "Fakire",
    "Nomaden",
    "Konstrukteure",
    "Zwerge",
  ],
  gamesLoaded: false,
  isLoading: false,
  season: 0,
};

const getters: GetterTree<TerraMysticaState, any> = {
  getIsLoading: (state) => state.isLoading,
  getAllTimeTable: (state) => {
    const allTimeEntries = getAllTimeTable(state.games);

    return allTimeEntries;
  },
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getResultTable: (state) => getResultTable(state.games),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getFactionsTable: (state, getters, _rootState, _rootGetters) => {
    const factions = getters.getFactions;

    const characterTableEntries: CharacterTableEntry[] = [];
    factions.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0, 0))
    );

    state.games.map((game) => {
      game.players.forEach((player) => {
        const elem = characterTableEntries.find(
          (entry) => entry.character === player.faction
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

          if (elem.points !== undefined) {
            elem.points +=
              player.placement === 1
                ? 5
                : player.placement === 2
                ? 3
                : player.placement === 3
                ? 2
                : 0;
          }
        }
      });
    });

    characterTableEntries.sort(compareCharacterTableEntries);

    characterTableEntries.forEach((entry) => {
      const total = entry.points;
      entry.points =
        total +
        ` (${
          total !== 0 ? Math.round(((total / entry.games) * 100) / 100) : 0
        })`;
    });

    return characterTableEntries;
  },
  getFactionsTableHeadings: (state) => state.factionsTableHeadings,
  getMyTopFactionsTable: (state, getters, _rootState, rootGetters) => {
    const factions = getters.getFactions;
    const user = rootGetters["user/getUser"];

    const characterTableEntries: CharacterTableEntry[] = [];
    factions.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0, 0))
    );

    state.games.map((game) => {
      game.players.forEach((player) => {
        if (player.user.username === user.username) {
          const elem = characterTableEntries.find(
            (entry) => entry.character === player.faction
          );

          if (elem) {
            if (player.placement === 1) {
              ++elem.games;
              ++elem.wins;
              elem.winrate = +(elem.wins / elem.games).toFixed(2) * 100;

              if (elem.points !== undefined) {
                elem.points += 5;
              }
            } else {
              ++elem.games;
              elem.winrate = +(elem.wins / elem.games).toFixed(2) * 100;

              if (elem.points !== undefined) {
                elem.points +=
                  player.placement === 2 ? 3 : player.placement === 3 ? 2 : 0;
              }
            }
          }
        }
      });
    });

    characterTableEntries.sort(compareCharacterTableEntries);

    characterTableEntries.forEach((entry) => {
      const total = entry.points;
      entry.points =
        total +
        ` (${
          total !== 0 ? Math.round(((total / entry.games) * 100) / 100) : 0
        })`;
    });

    return characterTableEntries;
  },
  getMyTopFactionsTableHeadings: (state) => state.myTopFactionsTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];

    return getSummary(state.summaryHeadings, state.games, user);
  },
  getFactions: (state) => state.factions,
  getGameScores: (state): GameScoreItem[] =>
    getGameScores(state.gameScoresHeadings, state.games),
  getGamesLastYear: (state) => {
    const today = new Date();
    const monthBuckets = Array.apply(null, Array(12)).map(() => 0);

    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

      state.games.forEach((game) => {
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
  },
  getWinDistributionPlayer: (state) => getWinDistributionPlayer(state.games),
  getAverageScores: (state) => {
    const average: AverageScores = new AverageScores([], 0);

    state.games.forEach((game) => {
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

    average.totalAverage = +(
      +average.totalAverage / state.games.length
    ).toFixed(2);
    average.players.forEach((pl) => {
      pl.average = +(pl.average / pl.games).toFixed(2);
    });

    return average;
  },
  getAveragePointsDistribution: (state): StackedColumChartData => {
    let players: string[] = [];
    let games: number[] = [];
    const points = new Series("Punkte", []);
    const area = new Series("Gebietswertung", []);
    const cult = new Series("Kultwertung", []);
    const resources = new Series("Ressourcen", []);

    state.games.forEach((game) => {
      game.players.forEach((player) => {
        let idx = players.indexOf(player.user.username);

        if (idx === -1) {
          players.push(player.user.username);
          games.push(1);
          points.data.push(player.gamePoints.toString());
          area.data.push(player.area.toString());
          cult.data.push(player.cult.toString());
          resources.data.push(player.resources.toString());
        } else {
          points.data[idx] = (
            +points.data[idx] + +player.gamePoints
          ).toString();
          area.data[idx] = (+area.data[idx] + +player.area).toString();
          cult.data[idx] = (+cult.data[idx] + +player.cult).toString();
          resources.data[idx] = (
            +resources.data[idx] + +player.resources
          ).toString();

          games[idx] = +games[idx] + 1;
        }
      });
    });

    points.data = points.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    area.data = area.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    cult.data = cult.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    resources.data = resources.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );

    return {
      categories: players,
      series: [points, area, cult, resources],
    };
  },
  getGamesLoaded: (state) => state.gamesLoaded,
  getGame: (state) => (time: number): TerraMysticaGame | undefined => {
    let game = undefined;
    state.games.forEach((g: TerraMysticaGame) => {
      if (g.time === time) {
        game = g;
      }
    });

    return game;
  },
  getSeason: (state) => state.season,
};

//Mutations Must Be Synchronous
const mutations: MutationTree<TerraMysticaState> = {
  setGames: (state, games: TerraMysticaGame[]) => {
    games.forEach((game) =>
      game.players.sort((a, b) => (a.placement < b.placement ? -1 : 1))
    );
    state.games = games;
    state.gamesLoaded = true;
  },
  setLoadingStatus: (state, isLoading) => {
    state.isLoading = isLoading;
  },
  reset: (state) => {
    state.games = [];
    state.gamesLoaded = false;
  },
};

const actions: ActionTree<TerraMysticaState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/terra-mystica-read", { params: payload })
      .then((response: any) => {
        commit("setGames", response.data.items);
      })
      .finally(() => {
        commit("setLoadingStatus", false);
      });
  },
  setLoading: ({ commit }, payload) => {
    commit("setLoadingStatus", payload);
  },
};

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

export const terraMystica = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
