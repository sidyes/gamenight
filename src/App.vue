<template>
  <div id="app">
    <Header
      :isLoggedIn="isLoggedIn"
      :user="user"
      @login="login"
      @logout="logout"
      @signup="signup"
    />
    <router-view />
    <Footer />
    <toast position="s"></toast>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Action, Getter } from "vuex-class";

import netlifyIdentity from "netlify-identity-widget";
import { Member } from "./models";

const toastLib = require("vuex-toast");
const axios = require("axios");

const Toast = toastLib.Toast;

@Component({
  components: { Header, Footer, Toast },
  name: "App"
})
export default class App extends Vue {
  @Action("fetchFriends", { namespace: "user" }) fetchFriends: any;
  @Action("updateUser", { namespace: "user" }) updateUser: any;

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
        token_type: user.token.token_type
      };
      this.updateUser({
        currentUser: this.currentUser
      });

      const member = {
        username: this.currentUser.username,
        email: this.currentUser.email
      };

      axios
        .post("/.netlify/functions/members-create", member)
        .then((response: any) => {
          console.log("Member added", member);
        });
      netlifyIdentity.close();
    });

    if (this.isLoggedIn) {
      this.fetchFriends(this.user);
    }
  }

  public login(): void {
    netlifyIdentity.open("login");
  }

  public signup(): void {
    netlifyIdentity.open("signup");
  }

  public logout(): void {
    this.currentUser = null;
    this.updateUser({
      currentUser: this.currentUser
    });
    netlifyIdentity.logout();
    this.$router.push({ name: "home" });
  }
}
</script>
