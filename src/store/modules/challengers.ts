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
import {
  GameSummaryItem,
  TableHeading,
  GameScoreItem,
  Series,
  StackedColumChartData,
  ChallengersGame,
  GameName,
  Member,
} from "@/models";

const axios = require("axios");

interface ChallengersState {
  games: ChallengersGame[];
  gamesLoaded: boolean;
  allTimeTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  resultTableHeadings: TableHeading[];
  isLoading: boolean;
  season: number;
  newScoringType: boolean;
}

const state: ChallengersState = {
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

const getters: GetterTree<ChallengersState, any> = {
  getTimePlayed: (state) => getTimePlayed(state.games),
  getIsLoading: (state) => state.isLoading,
  getGamesLoaded: (state) => state.gamesLoaded,
  getAllTimeTable: (state, _getters, _rootState, rootGetters) => {
    const elos = rootGetters["user/getElos"](GameName.CHALLENGERS);
    return getAllTimeTable(state.games, state.newScoringType, elos);
  },
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];

    const allPlayers = rootGetters["user/getPlayers"](GameName.CHALLENGERS);

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
    const fans = new Series("Fans", []);
    const trophies = new Series("Trophäen", []);

    state.games.forEach((game) => {
      game.players.forEach((player) => {
        const idx = players.indexOf(player.user.username);

        if (idx === -1) {
          players.push(player.user.username);
          games.push(1);
          fans.data.push(player.points.toString());
          trophies.data.push(player.trophies.toString());
        } else {
          fans.data[idx] = (+fans.data[idx] + +player.points).toString();
          trophies.data[idx] = (
            +trophies.data[idx] + +player.trophies
          ).toString();

          games[idx] = +games[idx] + 1;
        }
      });
    });

    fans.data = fans.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );
    trophies.data = trophies.data.map((total, idx) =>
      (+total / +games[idx]).toFixed(2)
    );

    return {
      categories: players,
      series: [fans, trophies],
    };
  },
  getGamesLastYear: (state) => getGamesLastYear(state.games),
  getResultTable: (state) => getResultTable(state.games),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getIsNewScoringType: (state) => state.newScoringType,
};

const mutations: MutationTree<ChallengersState> = {
  setGames: (state, games: ChallengersGame[]) => {
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

const actions: ActionTree<ChallengersState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/challengers-read", { params: payload })
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

export const challengers = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
