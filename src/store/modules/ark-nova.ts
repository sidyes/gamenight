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
} from "./../shared";
import { GetterTree, MutationTree, ActionTree } from "vuex";
import { GameSummaryItem, TableHeading, GameScoreItem } from "@/models";

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
  ],
  gamesLoaded: false,
  allTimeTableHeadings: [
    new TableHeading("Spieler", "username"),
    new TableHeading("Spiele", "games"),
    new TableHeading("🥇", "wins"),
    new TableHeading("🥈", "secondPlaces"),
    new TableHeading("🥉", "thirdPlaces"),
    new TableHeading("Punkte", "points"),
  ],
  summaryHeadings: ["Spiele", "Siege", "Siegquote (%)", "Ø Punkte"],
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
  season: 0,
  newScoringType: true,
};

const getters: GetterTree<ArkNovaState, any> = {
  getIsLoading: (state) => state.isLoading,
  getGamesLoaded: (state) => state.gamesLoaded,
  getAllTimeTable: (state) =>
    getAllTimeTable(state.games, state.newScoringType),
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];

    return getSummary(state.summaryHeadings, state.games, user);
  },
  getZooMaps: (state) => state.zooMaps,
  getGameScores: (state): GameScoreItem[] =>
    getGameScores(state.gameScoresHeadings, state.games),
  getWinDistributionPlayer: (state) => getWinDistributionPlayer(state.games),
  getAverageScores: (state) => getAverageScores(state.games),
  getGamesLastYear: (state) => getGamesLastYear(state.games),
  getResultTable: (state) => getResultTable(state.games),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getIsNewScoringType: (state) => state.newScoringType,
  getTimePlayed: (state) => getTimePlayed(state.games),
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
  getSeason: (state) => state.season,
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
};

export const arkNova = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
