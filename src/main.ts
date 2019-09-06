import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueApexCharts from "vue-apexcharts";

import GameSummary from "@/components/GameSummary.vue";
import ResultTable from "@/components/ResultTable.vue";
import NewGameModal from "@/components/NewGameModal.vue";
import GamesOverTime from "@/components/GamesOverTime.vue";
import GameScores from "@/components/GameScores.vue";

import "@/assets/main.scss";

Vue.config.productionTip = false;

Vue.use(VueApexCharts);

library.add(faHome);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("apexchart", VueApexCharts);
Vue.component("game-summary", GameSummary);
Vue.component("result-table", ResultTable);
Vue.component("new-game-modal", NewGameModal);
Vue.component("games-over-time", GamesOverTime);
Vue.component("game-scores", GameScores);

Vue.filter("placement", function (placement: number) {
  if (!placement) {
    return "-";
  }
  let medal = "";

  switch (placement) {
    case 1:
      medal = "🥇";
      break;
    case 2:
      medal = "🥈";
      break;
    case 3:
      medal = "🥉";
      break;
    default:
      medal = placement.toString();
      break;
  }

  return medal;
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
