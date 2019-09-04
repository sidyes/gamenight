import { Member } from "@/models/member.model";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
const axios = require("axios");

interface UserState {
  user: any;
  members: Member[];
}

const state: UserState = {
  user: window.localStorage.getItem("user"),
  members: []
};

const getters: GetterTree<UserState, any> = {
  getUserStatus: state => !!state.user,
  getUser: (state: any) => JSON.parse(state.user),
  getMembers: state => state.members
};

//Mutations Must Be Synchronous
const mutations: MutationTree<UserState> = {
  setUser: (state, currentUser: any) => {
    if (!currentUser) {
      state.user = null;
      window.localStorage.removeItem("user");
      return;
    }
    let theUser = JSON.stringify(currentUser);
    state.user = theUser;
    window.localStorage.setItem("user", theUser);
  },
  setMembers: (state, members: Member[]) => {
    state.members = members;
  }
};

const actions: ActionTree<UserState, any> = {
  updateUser: ({ commit }, payload) => {
    commit("setUser", payload.currentUser);
  },
  fetchMembers: ({ commit }) => {
    axios.get("/.netlify/functions/members-read").then((response: any) => {
      commit("setMembers", response.data);
    });
  }
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
