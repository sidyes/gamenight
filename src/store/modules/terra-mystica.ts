import {
  getAllTimeTable,
  getResultTable,
  getGameScores,
  getSummary,
  getWinDistributionPlayer,
  getAverageScores,
  getGamesForSeason,
  getGamesLastYear,
  getTimePlayed,
  compareCharacterTableEntries,
} from "./../shared";
import { TerraMysticaGame } from "./../../models/terra-mystica.model";
import { CharacterTableEntry } from "@/models/character-table-entry.model";
import { GameScoreItem } from "@/models/game-score-item.model";
import { TableHeading } from "@/models/table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { Series } from "@/models/series.model";
import { GameName, Member, StackedColumChartData } from "@/models";

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
  selectedSeason: number;
  maps: string[];
  newScoringType: boolean;
}

const state: TerraMysticaState = {
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Karte", "map"),
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
    "Alchimisten",
    "Auren",
    "Chaosmagier",
    "Drachenmeister",
    "Düsterlinge",
    "Fakire",
    "Flussläufer",
    "Frostfeen",
    "Geweihte",
    "Gestaltenwandler",
    "Giganten",
    "Halblinge",
    "Hexen",
    "Konstrukteure",
    "Kultisten",
    "Nixen",
    "Nomaden",
    "Schwarmlinge",
    "Zwerge",
    "Yetis",
  ],
  gamesLoaded: false,
  isLoading: false,
  season: 3,
  selectedSeason: 3,
  maps: [
    "Grundspiel",
    "Variante Grundspiel",
    "Feuer & Eis",
    "Die Seen",
    "Die Fjorde",
  ],
  newScoringType: true,
};

const getters: GetterTree<TerraMysticaState, any> = {
  getIsLoading: (state) => state.isLoading,
  getAllTimeTable: (state, _getters, _rootState, rootGetters) => {
    const elos = rootGetters["user/getElos"]("terraMystica");

    const allTimeEntries = getAllTimeTable(
      getGamesForSeason(state.selectedSeason, state.games),
      state.newScoringType,
      elos
    );

    return allTimeEntries;
  },
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getTimePlayed: (state) => getTimePlayed(state.games),
  getResultTable: (state) =>
    getResultTable(getGamesForSeason(state.selectedSeason, state.games)),
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getFactionsTable: (state, getters, _rootState, _rootGetters) => {
    const factions = getters.getFactions;

    const characterTableEntries: CharacterTableEntry[] = [];
    factions.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0, 0))
    );

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as TerraMysticaGame)
      .map((game) => {
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
              elem.points += player.points;
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

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as TerraMysticaGame)
      .map((game) => {
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
                  elem.points += player.points;
                }
              } else {
                ++elem.games;
                elem.winrate = +(elem.wins / elem.games).toFixed(2) * 100;

                if (elem.points !== undefined) {
                  elem.points += player.points;
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
    const allPlayers = rootGetters["user/getPlayers"](GameName.TERRA_MYSTICA);

    const userWithElo =
      allPlayers?.find((pl: Member) => pl.email === user.email) || user;

    return getSummary(
      state.summaryHeadings,
      getGamesForSeason(state.selectedSeason, state.games),
      userWithElo
    );
  },
  getFactions: (state) => state.factions,
  getGameScores: (state): GameScoreItem[] =>
    getGameScores(
      state.gameScoresHeadings,
      getGamesForSeason(state.selectedSeason, state.games)
    ),
  getGamesLastYear: (state) =>
    getGamesLastYear(getGamesForSeason(state.selectedSeason, state.games)),
  getWinDistributionPlayer: (state) =>
    getWinDistributionPlayer(
      getGamesForSeason(state.selectedSeason, state.games)
    ),
  getAverageScores: (state) =>
    getAverageScores(getGamesForSeason(state.selectedSeason, state.games)),
  getAveragePointsDistribution: (state): StackedColumChartData => {
    const players: string[] = [];
    const games: number[] = [];
    const points = new Series("Punkte", []);
    const area = new Series("Gebietswertung", []);
    const cult = new Series("Kultwertung", []);
    const resources = new Series("Ressourcen", []);

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as TerraMysticaGame)
      .forEach((game) => {
        game.players.forEach((player) => {
          const idx = players.indexOf(player.user.username);

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
  getGame:
    (state) =>
    (time: number): TerraMysticaGame | undefined => {
      let game = undefined;
      state.games.forEach((g: TerraMysticaGame) => {
        if (g.time === time) {
          game = g;
        }
      });

      return game;
    },
  getSeason: (state) => state.season,
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
  getMaps: (state) => state.maps,
  getIsNewScoringType: (state) => state.newScoringType,
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
  setSelectedSeason: (state, season) => {
    state.selectedSeason = season;
  },
  toggleScoringType: (state) => {
    state.newScoringType = !state.newScoringType;
  },
};

const actions: ActionTree<TerraMysticaState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/game-read", { params: payload })
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
  setSeason: ({ commit }, payload) => {
    commit("setSelectedSeason", payload);
  },
  toggleScoringType: ({ commit }) => {
    commit("toggleScoringType");
  },
};

export const terraMystica = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
