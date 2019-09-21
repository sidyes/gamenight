import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import { Store } from "vuex";

const store: Store<any> = require("@/store");

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/marco-polo",
      name: "marco-polo",
      component: () => import("./views/MarcoPolo.vue")
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("./views/Profile.vue"),
      beforeEnter: checkAuth
    }
  ]
});

export function checkAuth(to: any, from: any, next: any) {
  if (!!store.state.user.user) {
    next()

  } else {
    next('/home')
  }
}
