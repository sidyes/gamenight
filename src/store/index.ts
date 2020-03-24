import Vue from "vue";
import Vuex from "vuex";
import { user } from "./modules/user";
import { marcoPolo } from "./modules/marco-polo";
import { wingspan } from "./modules/wingspan";

const toast = require("vuex-toast");

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    toast: toast.createModule({
      dismissInterval: 8000,
    }),
    user,
    marcoPolo,
    wingspan,
  },
  actions: {
    clearStore({ commit }) {
      commit("user/reset");
      commit("marcoPolo/reset");
      commit("wingspan/reset");
    },
  },
});
