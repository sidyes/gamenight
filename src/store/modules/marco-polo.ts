import { ResultTableHeading } from "@/models/result-table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { MarcoPoloGame } from "@/models/marco-polo.model";
const axios = require("axios");

interface MarcoPoloState {
  resultTable: {
    headings: ResultTableHeading[];
    items: any[];
  };
  summary: GameSummaryItem[];
  games: MarcoPoloGame[];
  characters: string[];
}

const state: MarcoPoloState = {
  resultTable: {
    headings: [
      new ResultTableHeading("Date", "date"),
      new ResultTableHeading("Location", "location"),
      new ResultTableHeading("Players (Start Position)", "players"),
      new ResultTableHeading("Winner (Points", "winner")
    ],
    items: []
  },
  summary: [
    new GameSummaryItem("Games", "0"),
    new GameSummaryItem("Wins", "0"),
    new GameSummaryItem("Win Percentage", "-"),
    new GameSummaryItem("Avg Points", "-")
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
  getResultTable: state => state.resultTable.items,
  getResultTableHeadings: state => state.resultTable.headings,
  getSummary: state => state.summary, // TODO: calculate summarry here
  getCharacters: state => state.characters
};

//Mutations Must Be Synchronous
const mutations: MutationTree<MarcoPoloState> = {
  setGames: (state, games: MarcoPoloGame[]) => {
    state.games = games;
  }
};

const actions: ActionTree<MarcoPoloState, any> = {
  fetchGames: ({ commit }) => {
    axios.get("/.netlify/functions/marco-polo-read").then((response: any) => {
      commit("setGames", response.data);
    });
  }
};

export const marcoPolo = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
