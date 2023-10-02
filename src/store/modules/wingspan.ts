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
import { WingspanGame } from "@/models/wingspan.model";
import { GetterTree, MutationTree, ActionTree } from "vuex";
import {
  GameSummaryItem,
  TableHeading,
  GameScoreItem,
  Series,
  StackedColumChartData,
  GameName,
  Member,
} from "@/models";

const axios = require("axios");

interface WingspanState {
  games: WingspanGame[];
  gamesLoaded: boolean;
  allTimeTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  resultTableHeadings: TableHeading[];
  isLoading: boolean;
  season: number;
  newScoringType: boolean;
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

const getters: GetterTree<WingspanState, any> = {
  getTimePlayed: (state) => getTimePlayed(state.games),
  getIsLoading: (state) => state.isLoading,
  getGamesLoaded: (state) => state.gamesLoaded,
  getAllTimeTable: (state, _getters, _rootState, rootGetters) => {
    const elos = rootGetters["user/getElos"](GameName.WINGSPAN);

    return getAllTimeTable(state.games, state.newScoringType, elos);
  },
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];
    const allPlayers = rootGetters["user/getPlayers"](GameName.WINGSPAN);

    const userWithElo =
      allPlayers?.find((pl: Member) => pl.email === user.email) || user;

    return getSummary(state.summaryHeadings, state.games, userWithElo);
  },
  getGameScores: (state): GameScoreItem[] =>
    getGameScores(state.gameScoresHeadings, state.games),
  getWinDistributionPlayer: (state) => getWinDistributionPlayer(state.games),
  getAverageScores: (state) => getAverageScores(state.games),
  getAveragePointsDistribution: (state): StackedColumChartData => {
    const players: string[] = [];
    const games: number[] = [];
    const birds = new Series("Vögel", []);
    const bonusCards = new Series("Bonuskarten", []);
    const endOfRoundGoals = new Series("Rundenziele", []);
    const eggs = new Series("Eier", []);
    const foodOnCards = new Series("Gelagertes Futter", []);
    const tuckedCards = new Series("Karten unter Vögeln", []);

    state.games.forEach((game) => {
      game.players.forEach((player) => {
        const idx = players.indexOf(player.user.username);

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
        tuckedCards,
      ],
    };
  },
  getGamesLastYear: (state) => getGamesLastYear(state.games),
  getResultTable: (state) => getResultTable(state.games),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getIsNewScoringType: (state) => state.newScoringType,
};

const mutations: MutationTree<WingspanState> = {
  setGames: (state, games: WingspanGame[]) => {
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

const actions: ActionTree<WingspanState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/wingspan-read", { params: payload })
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

export const wingspan = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
