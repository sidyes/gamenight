import { Member } from "@/models/member.model";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import { } from "axios";
const axios = require("axios");

interface UserState {
  user: any;
  friends: Member[];
}

const state: UserState = {
  user: window.localStorage.getItem("user"),
  friends: []
};

const getters: GetterTree<UserState, any> = {
  getUserStatus: state => !!state.user,
  getUser: (state: any) => JSON.parse(state.user),
  getFriends: state => state.friends,
  getPlayers: state => {
    let players = [...state.friends];
    const me = JSON.parse(state.user);
    players.push(new Member(me.username, me.email));

    return players;
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
    let theUser = JSON.stringify(currentUser);
    state.user = theUser;
    window.localStorage.setItem("user", theUser);
  },
  setFriends: (state, friends: Member[]) => {
    state.friends = friends;
  }
};

const actions: ActionTree<UserState, any> = {
  updateUser: ({ commit }, payload) => {
    commit("setUser", payload.currentUser);
  },
  fetchFriends: ({ commit }, payload) => {
    axios.get("/.netlify/functions/friends-read", { params: payload }).then((response: any) => {
      commit("setFriends", response.data);
    })
  }
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
