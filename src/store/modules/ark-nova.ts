import { ArkNovaGame } from "./../../models/ark-nova.model";
import {
  getAllTimeTable,
  getResultTable,
  getSummary,
  getGameScores,
  getWinDistributionPlayer,
  getAverageScores,
  getGamesLastYear,
  getTimePlayed,
  getGamesForSeason,
  compareCharacterTableEntries,
} from "./../shared";
import { GetterTree, MutationTree, ActionTree } from "vuex";
import {
  GameSummaryItem,
  TableHeading,
  GameScoreItem,
  CharacterTableEntry,
} from "@/models";

const axios = require("axios");

interface ArkNovaState {
  games: ArkNovaGame[];
  zooMaps: string[];
  gamesLoaded: boolean;
  allTimeTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  resultTableHeadings: TableHeading[];
  isLoading: boolean;
  season: number;
  newScoringType: boolean;
  zooTableHeadings: TableHeading[];
  selectedSeason: number;
}

const state: ArkNovaState = {
  games: [],
  zooMaps: [
    "Plan A",
    "Plan 0",
    "Plan 1",
    "Plan 2",
    "Plan 3",
    "Plan 4",
    "Plan 5",
    "Plan 6",
    "Plan 7",
    "Plan 8",
    "Plan 9",
    "Plan 10",
  ],
  zooTableHeadings: [
    new TableHeading("Top Zoos", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate"),
    new TableHeading("Erspielte Gesamtpunkte (Ø pro Spiel)", "points"),
  ],
  gamesLoaded: false,
  allTimeTableHeadings: [
    new TableHeading("Spieler", "username"),
    new TableHeading("⭐", "elo"),
    new TableHeading("Spiele", "games"),
    new TableHeading("🥇", "wins"),
    new TableHeading("🥈", "secondPlaces"),
    new TableHeading("🥉", "thirdPlaces"),
    new TableHeading("Punkte", "points"),
  ],
  summaryHeadings: ["Elo", "Spiele", "Siege", "Siegquote (%)", "Ø Punkte"],
  gameScoresHeadings: [
    "Top Score",
    "Highest Losing Score",
    "Avg Score",
    "Lowest Win Score",
    "Lowest Score",
  ],
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Spieler", "players"),
    new TableHeading("Ø Punkte", "avg"),
    new TableHeading("Gewinner (Punkte)", "winner"),
  ],
  isLoading: false,
  season: 1,
  selectedSeason: 1,
  newScoringType: true,
};

const getters: GetterTree<ArkNovaState, any> = {
  getIsLoading: (state) => state.isLoading,
  getGamesLoaded: (state) => state.gamesLoaded,
  getAllTimeTable: (state, _getters, _rootState, rootGetters) => {
    const elos = rootGetters["user/getElos"]("arkNova");

    const allTimeEntries = getAllTimeTable(
      getGamesForSeason(state.selectedSeason, state.games),
      state.newScoringType,
      elos
    );

    return allTimeEntries;
  },
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];

    return getSummary(
      state.summaryHeadings,
      getGamesForSeason(state.selectedSeason, state.games),
      user,
      "arkNova"
    );
  },
  getSeason: (state) => state.season,
  getZooMaps: (state) => state.zooMaps,
  getGameScores: (state): GameScoreItem[] =>
    getGameScores(
      state.gameScoresHeadings,
      getGamesForSeason(state.selectedSeason, state.games)
    ),
  getWinDistributionPlayer: (state) =>
    getWinDistributionPlayer(
      getGamesForSeason(state.selectedSeason, state.games)
    ),
  getAverageScores: (state) =>
    getAverageScores(getGamesForSeason(state.selectedSeason, state.games)),
  getGamesLastYear: (state) =>
    getGamesLastYear(getGamesForSeason(state.selectedSeason, state.games)),
  getResultTable: (state) =>
    getResultTable(getGamesForSeason(state.selectedSeason, state.games)),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getIsNewScoringType: (state) => state.newScoringType,
  getTimePlayed: (state) =>
    getTimePlayed(getGamesForSeason(state.selectedSeason, state.games)),
  getZooTableHeadings: (state) => state.zooTableHeadings,
  getZooTable: (state, getters, _rootState, _rootGetters) => {
    const zoos = getters.getZooMaps;

    const zooTableEntries: CharacterTableEntry[] = [];
    zoos.forEach((zoo: string) =>
      zooTableEntries.push(new CharacterTableEntry(zoo, 0, 0, 0, 0))
    );

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as ArkNovaGame)
      .map((game) => {
        game.players.forEach((player) => {
          const elem = zooTableEntries.find(
            (entry) => entry.character === player.zooMap
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
              elem.points += player.points;
            }
          }
        });
      });

    zooTableEntries.sort(compareCharacterTableEntries);

    zooTableEntries.forEach((entry) => {
      const total = entry.points;
      entry.points =
        total +
        ` (${
          total !== 0 ? Math.round(((total / entry.games) * 100) / 100) : 0
        })`;
    });

    return zooTableEntries;
  },
  getGame:
    (state) =>
    (time: number): ArkNovaGame | undefined => {
      let game = undefined;
      state.games.forEach((g: ArkNovaGame) => {
        if (g.time === time) {
          game = g;
        }
      });

      return game;
    },
  getAllSeasons: (state) => {
    const seasons: number[] = [];
    let iterator = 0;

    while (iterator !== state.season + 1) {
      seasons.push(iterator);
      iterator++;
    }

    return seasons;
  },
  getSelectedSeason: (state) => state.selectedSeason,
};

const mutations: MutationTree<ArkNovaState> = {
  setGames: (state, games: ArkNovaGame[]) => {
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
  setSelectedSeason: (state, season) => {
    state.selectedSeason = season;
  },
  toggleScoringType: (state) => {
    state.newScoringType = !state.newScoringType;
  },
};

const actions: ActionTree<ArkNovaState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/ark-nova-read", { params: payload })
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
  toggleScoringType: ({ commit }) => {
    commit("toggleScoringType");
  },
  setSeason: ({ commit }, payload) => {
    commit("setSelectedSeason", payload);
  },
};

export const arkNova = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
