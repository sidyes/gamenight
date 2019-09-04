import Vue from "vue";
import Vuex from "vuex";
import { user } from "./modules/user";
import { marcoPolo } from "./modules/marco-polo";

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    user,
    marcoPolo
  }
});
