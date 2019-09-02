
import { MutationTree, ActionTree, GetterTree } from "vuex";
import { } from "axios";
import { MarcoPoloGame } from '@/models/marco-polo.model';
const axios = require("axios");

interface MarcoPoloState {
    games: MarcoPoloGame[];
}

const state: MarcoPoloState = {
    games: []
};

const getters: GetterTree<MarcoPoloState, any> = {
    getGames: state => state.games,
};

//Mutations Must Be Synchronous
const mutations: MutationTree<MarcoPoloState> = {
    setGames: (state, games: MarcoPoloGame[]) => {
        state.games = games;
    }
};

const actions: ActionTree<MarcoPoloState, any> = {
    fetchGames: ({ commit }) => {
        axios
            .get("/.netlify/functions/marco-polo-read")
            .then((response: any) => {
                commit("setGames", response.data);
            });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
