import { MutationTree, ActionTree, GetterTree } from "vuex";

interface UserState {
  user: any;
}

const state: UserState = {
  user: window.localStorage.getItem("user")
};

const getters: GetterTree<UserState, any> = {
  getUserStatus: state => !!state.user,
  getUser: (state: any) => JSON.parse(state.user)
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
  }
};

const actions: ActionTree<UserState, any> = {
  updateUser: ({ commit }, payload) => {
    commit("setUser", payload.currentUser);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
