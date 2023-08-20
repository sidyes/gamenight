import { arkNova } from "./modules/ark-nova";
import { challengers } from "./modules/challengers";
import { terraMystica } from "./modules/terra-mystica";
import Vue from "vue";
import Vuex from "vuex";
import { user } from "./modules/user";
import { marcoPolo } from "./modules/marco-polo";
import { wingspan } from "./modules/wingspan";
import { createModule } from "vuex-toast";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    toast: createModule({
      dismissInterval: 8000,
    }),
    user,
    marcoPolo,
    wingspan,
    terraMystica,
    arkNova,
    challengers,
  },
  actions: {
    clearStore({ commit }) {
      commit("user/reset");
      commit("marcoPolo/reset");
      commit("wingspan/reset");
      commit("terraMystica/reset");
      commit("arkNova/reset");
      commit("challengers/reset");
    },
  },
});
