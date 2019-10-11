import { Member } from "@/models/member.model";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
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
  getUser: (state: any, getters): Member | undefined => {
    if (!getters.getUserStatus) {
      return undefined;
    }
    const user = JSON.parse(state.user);

    return new Member(user.username, user.email);
  },
  getFriends: state => state.friends,
  getPlayers: (state, getters) => {
    let players = [...state.friends];
    const me = getters.getUser;

    if (me) {
      players.push(me);
    }

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
  },
  addFriend: (state, friend: Member) => {
    state.friends = [...state.friends, friend];
  },
  removeFriend: (state, friend: Member) => {
    state.friends = state.friends.filter(fr => fr.email !== friend.email);
  },
  reset: state => {
    state.friends = [];
  }
};

const actions: ActionTree<UserState, any> = {
  updateUser: ({ commit }, payload) => {
    commit("setUser", payload.currentUser);
  },
  fetchFriends: ({ commit }, payload) => {
    axios
      .get("/.netlify/functions/friends-read", { params: payload })
      .then((response: any) => commit("setFriends", response.data.friends));
  },
  addFriend: ({ commit }, payload) => {
    commit("addFriend", payload);
  },
  removeFriend: ({ commit }, payload) => {
    commit("removeFriend", payload);
  }
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
