import { Member } from "@/models/member.model";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import {} from "axios";
import { GameName, PlayerElo } from "@/models";
const axios = require("axios");

interface UserState {
  user: any;
  friends: Member[];
  allPlayers: Member[];
}

const state: UserState = {
  user: window.localStorage.getItem("user"),
  friends: [],
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
  getFriends: (state) => state.friends,
  getAllPlayers: (state) => state.allPlayers,
  getPlayers: (state, getters) => (game: GameName) => {
    // merge elo information with players info
    const allPlayers = getters.getAllPlayers;
    const players = [...state.friends];
    const me = getters.getUser;

    if (me) {
      players.push(me);
    }

    return players.map((pl) => ({
      ...pl,
      elo: allPlayers.find((p: Member) => p.email === pl.email)?.elo[game],
    }));
  },
  getElos: (state) => (game: string) => {
    return state.allPlayers.map(
      (player) =>
        new PlayerElo(player.username, player.email, (player.elo as any)[game])
    );
  },
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
  setFriends: (state, friends: Member[]) => {
    state.friends = friends;
  },
  setAllPlayers: (state, allPlayers: Member[]) => {
    state.allPlayers = allPlayers;
  },
  addFriend: (state, friend: Member) => {
    state.friends = [...state.friends, friend];
  },
  removeFriend: (state, friend: Member) => {
    state.friends = state.friends.filter((fr) => fr.email !== friend.email);
  },
  reset: (state) => {
    state.friends = [];
  },
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
  fetchAllPlayers: ({ commit }) => {
    axios
      .get("/.netlify/functions/members-read")
      .then((response: any) => commit("setAllPlayers", response.data.items));
  },
  addFriend: ({ commit }, payload) => {
    commit("addFriend", payload);
  },
  removeFriend: ({ commit }, payload) => {
    commit("removeFriend", payload);
  },
};

export const user = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
