<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Getter, Action } from "vuex-class";

const axios = require("axios");

@Component({
  components: { Header, Footer },
  name: "App"
})
export default class App extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;

  mounted() {
    // axios
    //   .post("/.netlify/functions/user-create", {
    //     name: "ez",
    //     age: 12
    //   })
    //   .then((response: any) => console.log(response));
  }
}
</script>
