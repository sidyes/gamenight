import { Member } from "@/models/member.model";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
const axios = require("axios");

interface UserState {
  user: any;
  allPlayers: Member[];
}

const state: UserState = {
  user: window.localStorage.getItem("user"),
  allPlayers: [],
};

const getters: GetterTree<UserState, any> = {
  getUserStatus: (state) => !!state.user,
  getUser: (state: any, getters): Member | undefined => {
    if (!getters.getUserStatus) {
      return undefined;
    }
    const user = JSON.parse(state.user);

    return user;
  },
  getAllPlayers: (state) => state.allPlayers,
  getPlayers: (state) => () => {
    return state.allPlayers
  }
};

//Mutations Must Be Synchronous
const mutations: MutationTree<UserState> = {
  setUser: (state, currentUser: any) => {
    if (!currentUser) {
      state.user = null;
      window.localStorage.removeItem("user");
      return;
    }
    const theUser = JSON.stringify(currentUser);
    state.user = theUser;
    window.localStorage.setItem("user", theUser);
  },
  setAllPlayers: (state, allPlayers: Member[]) => {
    state.allPlayers = allPlayers;
  }
};

const actions: ActionTree<UserState, any> = {
  updateUser: ({ commit }, payload) => {
    commit("setUser", payload.currentUser);
  },
  fetchAllPlayers: ({ commit }) => {
    axios
      .get("/.netlify/functions/members-read")
      .then((response: any) => commit("setAllPlayers", response.data));
  },
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
