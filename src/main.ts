import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faEnvelope, faHome, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueApexCharts from "vue-apexcharts";

import GameSummary from "@/components/GameSummary.vue";
import CustomTable from "@/components/CustomTable.vue";
import NewGameModal from "@/components/NewGameModal.vue";
import GamesOverTime from "@/components/GamesOverTime.vue";
import GameScores from "@/components/GameScores.vue";
import PieChart from "@/components/PieChart.vue";
import BannerNotification from "@/components/BannerNotification.vue";
import AverageScoresWidget from "@/components/AverageScoresWidget.vue";
import StackedColumnChart from "@/components/StackedColumnChart.vue";
import NextGameEvent from "@/components/NextGameEvent.vue";
import CountdownCircle from "@/components/CountdownCircle.vue";

import "vuex-toast/dist/vuex-toast.css";
import "@/assets/main.scss";

Vue.config.productionTip = false;

Vue.use(VueApexCharts);

// global theme
const Apex = (window as any).Apex;
Apex.theme = {
  palette: "palette8",
};

Apex.chart = {
  foreColor: "#FFF",
};

library.add(faHome);
library.add(faUser);
library.add(faEnvelope);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("apexchart", VueApexCharts);
Vue.component("game-summary", GameSummary);
Vue.component("custom-table", CustomTable);
Vue.component("new-game-modal", NewGameModal);
Vue.component("games-over-time", GamesOverTime);
Vue.component("game-scores", GameScores);
Vue.component("pie-chart", PieChart);
Vue.component("banner-notification", BannerNotification);
Vue.component("average-scores-widget", AverageScoresWidget);
Vue.component("stacked-column-chart", StackedColumnChart);
Vue.component("next-game-event", NextGameEvent);
Vue.component("countdown-circle", CountdownCircle);

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
  render: (h) => h(App),
}).$mount("#app");
