<template>
  <div id="app">
    <Header
      :isLoggedIn="isLoggedIn"
      :user="user"
      @login="login"
      @logout="logout"
    />
    <router-view />
    <Footer />
    <toast position="s"></toast>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Action, Getter } from "vuex-class";

import netlifyIdentity from "netlify-identity-widget";
import { Member } from "./models";
import { Toast } from "vuex-toast";


@Component({
  components: { Header, Footer, Toast },
  name: "App",
})
export default class App extends Vue {
  @Action("fetchAllPlayers", { namespace: "user" }) fetchAllPlayers: any;
  @Action("updateUser", { namespace: "user" }) updateUser: any;
  @Action("clearStore") clearStore: any;

  @Getter("getUser", { namespace: "user" }) user!: Member;
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;

  currentUser: any = null;

  public created(): void {
    netlifyIdentity.init({});

    netlifyIdentity.on("login", (user: any) => {
      this.currentUser = {
        username: user.user_metadata.full_name,
        email: user.email,
        access_token: user.token.access_token,
        expires_at: user.token.expires_at,
        refresh_token: user.token.refresh_token,
        token_type: user.token.token_type,
      };
      this.updateUser({
        currentUser: this.currentUser,
      });

      netlifyIdentity.close();
    });
  }

  @Watch("isLoggedIn", { immediate: true, deep: true })
  onIsLoggedInChange(newVal: boolean) {
    if (newVal) {
      this.fetchAllPlayers();
    }
  }

  public login(): void {
    netlifyIdentity.open("login");
  }

  public logout(): void {
    this.currentUser = null;
    this.updateUser({
      currentUser: this.currentUser,
    });
    netlifyIdentity.logout();
    this.$router.push({ name: "home" });

    this.clearStore();
  }
}
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
}
</style>
