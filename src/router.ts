import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

import store from "@/store";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/marco-polo",
      name: "marco-polo",
      component: () => import("./views/MarcoPolo.vue"),
    },
    {
      path: "/marco-polo/:time",
      name: "marco-polo-detail",
      component: () => import("./views/MarcoPoloDetail.vue"),
      props: (route) => {
        const time = Number.parseInt(route.params.time);
        if (Number.isNaN(time)) {
          return { time: 0 };
        }

        return { time };
      },
      beforeEnter: checkAuth,
    },
    {
      path: "/wingspan",
      name: "wingspan",
      component: () => import("./views/Wingspan.vue"),
    },
    {
      path: "/terra-mystica",
      name: "terra-mystica",
      component: () => import("./views/TerraMystica.vue"),
    },
    {
      path: "/ark-nova",
      name: "ark-nova",
      component: () => import("./views/ArkNova.vue"),
    },
    {
      path: "/ark-nova/:time",
      name: "ark-nova-detail",
      component: () => import("./views/ArkNovaDetail.vue"),
      props: (route) => {
        const time = Number.parseInt(route.params.time);
        if (Number.isNaN(time)) {
          return { time: 0 };
        }

        return { time };
      },
      beforeEnter: checkAuth,
    },
    {
      path: "/terra-mystica/:time",
      name: "terra-mystica-detail",
      component: () => import("./views/TerraMysticaDetail.vue"),
      props: (route) => {
        const time = Number.parseInt(route.params.time);
        if (Number.isNaN(time)) {
          return { time: 0 };
        }

        return { time };
      },
      beforeEnter: checkAuth,
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("./views/Profile.vue"),
      beforeEnter: checkAuth,
    },
    {
      path: "/data-privacy",
      name: "data-privacy",
      component: () => import("./views/DataPrivacy.vue"),
    },
    {
      path: "/imprint",
      name: "imprint",
      component: () => import("./views/Imprint.vue"),
    },
    {
      path: "*",
      component: () => import("./views/NotFound.vue"),
    },
  ],
});

export function checkAuth(to: any, from: any, next: any) {
  const storeUpdated = store as any;
  if (storeUpdated.state.user.user) {
    next();
  } else {
    next("/home");
  }
}
