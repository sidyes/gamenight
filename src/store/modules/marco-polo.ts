import {
  getAllTimeTable,
  getSummary,
  getGameScores,
  getWinDistributionPlayer,
  getAverageScores,
  getGamesLastYear,
  getGamesForSeason,
  getTimePlayed,
} from "./../shared";
import { CharacterTableEntry } from "@/models/character-table-entry.model";
import { ResultTableEntry } from "@/models/result-table-entry.model";
import { WinDistribution } from "@/models/win-distribution.model";
import { GameScoreItem } from "@/models/game-score-item.model";
import { TableHeading } from "@/models/table-heading.model";
import { GameSummaryItem } from "@/models/game-summary-item.model";

import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { MarcoPoloGame } from "@/models/marco-polo.model";

const axios = require("axios");

interface MarcoPoloState {
  resultTableHeadings: TableHeading[];
  allTimeTableHeadings: TableHeading[];
  characterTableHeadings: TableHeading[];
  myTopcharacterTableHeadings: TableHeading[];
  summaryHeadings: string[];
  gameScoresHeadings: string[];
  games: MarcoPoloGame[];
  characters: string[];
  gamesLoaded: boolean;
  isLoading: boolean;
  season: number;
  selectedSeason: number;
  newScoringType: boolean;
}

const state: MarcoPoloState = {
  resultTableHeadings: [
    new TableHeading("Datum", "date"),
    new TableHeading("Ort", "location"),
    new TableHeading("Spieler (Startposition)", "players"),
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
  characterTableHeadings: [
    new TableHeading("Top Charaktere", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate"),
    new TableHeading("Erspielte Punkte (Ø pro Spiel)", "points"),
  ],
  myTopcharacterTableHeadings: [
    new TableHeading("Meine Top Charaktere", "character"),
    new TableHeading("Spiele", "games"),
    new TableHeading("Siege", "wins"),
    new TableHeading("Siegquote (%)", "winrate"),
    new TableHeading("Erspielte Punkte (Ø pro Spiel)", "points"),
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
  characters: [
    "Altan Ord",
    "André de Longjumeau",
    "Bellela, Fantina & Moreta",
    "Berke Khan",
    "Donata Badoer",
    "Fratre Nicolao",
    "Gunj Kököchin",
    "Johannes Caprini",
    "Khan Arghun",
    "Kubilai Khan",
    "Matteo Polo",
    "Mercator ex Tabriz",
    "Niccolo und Marco Polo",
    "Papa Gregorio X",
    "Piedro Tartarino",
    "Raschi ad-Din Sinan",
    "Rusticiano",
    "Wilhelm von Rubruk",
  ],
  gamesLoaded: false,
  isLoading: false,
  season: 2,
  selectedSeason: 2,
  newScoringType: true,
};

const getters: GetterTree<MarcoPoloState, any> = {
  getIsLoading: (state) => state.isLoading,
  getAllTimeTable: (state) =>
    getAllTimeTable(
      getGamesForSeason(state.selectedSeason, state.games),
      state.newScoringType
    ),
  getAllTimeTableHeadings: (state) => state.allTimeTableHeadings,
  getResultTable: (state) =>
    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as MarcoPoloGame)
      .map((game: MarcoPoloGame) => {
        const date = new Date(game.time).toDateString();
        const copiedPlayers = [...game.players];
        copiedPlayers.sort((a, b) => {
          if (a.startPosition < b.startPosition) {
            return -1;
          } else {
            return 1;
          }
        });
        const players = copiedPlayers
          .map((user) =>
            user.user ? `${user.user.username} (${user.startPosition})` : ""
          )
          .join(", ");
        const location = game.location;
        const playerWon = game.players.find((pl) => pl.placement === 1);
        const winner = playerWon
          ? `${playerWon.user.username} (${playerWon.points})`
          : "-";

        const avg = (
          game.players.map((pl) => pl.points).reduce((a, b) => +a + +b) /
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
  getResultTableHeadings: (state) => state.resultTableHeadings,
  getCharacterTable: (state, getters, _rootState, _rootGetters) => {
    const characters = getters.getCharacters;

    const characterTableEntries: CharacterTableEntry[] = [];
    characters.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0, 0))
    );

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as MarcoPoloGame)
      .map((game) => {
        game.players.forEach((player) => {
          const elem = characterTableEntries.find(
            (entry) => entry.character === player.character
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
  getCharacterTableHeadings: (state) => state.characterTableHeadings,
  getMyTopCharacterTable: (state, getters, _rootState, rootGetters) => {
    const characters = getters.getCharacters;
    const user = rootGetters["user/getUser"];

    const characterTableEntries: CharacterTableEntry[] = [];
    characters.forEach((char: string) =>
      characterTableEntries.push(new CharacterTableEntry(char, 0, 0, 0, 0))
    );

    getGamesForSeason(state.selectedSeason, state.games)
      .map((game) => game as MarcoPoloGame)
      .map((game) => {
        game.players.forEach((player) => {
          if (player.user.username === user.username) {
            const elem = characterTableEntries.find(
              (entry) => entry.character === player.character
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
  getMyTopCharacterTableHeadings: (state) => state.myTopcharacterTableHeadings,
  getSummary: (state, _getters, _rootState, rootGetters): GameSummaryItem[] => {
    const user = rootGetters["user/getUser"];

    return getSummary(
      state.summaryHeadings,
      getGamesForSeason(state.selectedSeason, state.games),
      user
    );
  },
  getCharacters: (state) => state.characters,
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
  getWinDistributionStartPosition: (state) => {
    const startPositions: string[] = ["1", "2", "3", "4"];
    let wins: number[] = [0, 0, 0, 0];

    const games = getGamesForSeason(state.selectedSeason, state.games);

    games
      .map((game) => game as MarcoPoloGame)
      .forEach((game) => {
        game.players.forEach((player) => {
          if (player.placement === 1) {
            wins[player.startPosition - 1]++;
          }
        });
      });

    if (games.length === 0) {
      wins = [1, 1, 1, 1];
    }

    return new WinDistribution(startPositions, wins);
  },
  getTimePlayed: (state) => getTimePlayed(state.games),
  getAverageScores: (state) =>
    getAverageScores(getGamesForSeason(state.selectedSeason, state.games)),
  getGamesLoaded: (state) => state.gamesLoaded,
  getGame:
    (state) =>
    (time: number): MarcoPoloGame | undefined => {
      let game = undefined;
      state.games.forEach((g: MarcoPoloGame) => {
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
  getIsNewScoringType: (state) => state.newScoringType,
};

//Mutations Must Be Synchronous
const mutations: MutationTree<MarcoPoloState> = {
  setGames: (state, games: MarcoPoloGame[]) => {
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

const actions: ActionTree<MarcoPoloState, any> = {
  fetchGames: ({ commit }, payload) => {
    commit("setLoadingStatus", true);
    axios
      .get("/.netlify/functions/marco-polo-read", { params: payload })
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
  mutations,
};
