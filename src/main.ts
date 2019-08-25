import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

import "@/assets/main.scss";

Vue.config.productionTip = false;

Vue.filter("placement", function(placement: number) {
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
