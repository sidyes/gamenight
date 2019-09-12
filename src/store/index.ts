import Vue from "vue";
import Vuex from "vuex";
import { user } from "./modules/user";
import { marcoPolo } from "./modules/marco-polo";

const toast = require("vuex-toast");


Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    toast: toast.createModule({
      dismissInterval: 8000
    }),
    user,
    marcoPolo
  }
});
