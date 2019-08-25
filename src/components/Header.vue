<template>
  <nav class="navbar has-shadow is-spaced">
    <div class="container">
      <div class="navbar-brand">
        <a href="/" class="navbar-item">
          <img src="@/assets/logo.svg" width="50" />

          <p class="has-text-weight-semibold">GameNight</p>
        </a>

        <a
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarMenu"
          @click="isOpen = !isOpen"
          v-bind:class="{ 'is-active': isOpen }"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbarMenu"
        class="navbar-menu"
        v-bind:class="{ 'is-active': isOpen }"
      >
        <div class="navbar-start">
          <router-link to="/" class="navbar-item" @click="isOpen = !isOpen"
            >Home</router-link
          >

          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">Games</a>

            <div class="navbar-dropdown">
              <router-link to="/marco-polo" class="navbar-item"
                >Marco Polo</router-link
              >
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons" v-if="!isLoggedIn">
              <a
                class="button is-primary"
                @click="triggerNetlifyIdentityAction('signup')"
              >
                <strong>Sign up</strong>
              </a>
              <a
                class="button is-light"
                @click="triggerNetlifyIdentityAction('login')"
                >Log in</a
              >
            </div>
            <a
              class="button is-primary"
              v-if="isLoggedIn"
              @click="triggerNetlifyIdentityAction('logout')"
            >
              <strong>Logout</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import netlifyIdentity from "netlify-identity-widget";

import { Getter, Action } from "vuex-class";

const namespace: string = "user";

@Component
export default class Header extends Vue {
  isOpen = false;

  @Getter("getUser", { namespace }) user: any;
  @Getter("getUserStatus", { namespace }) isLoggedIn!: boolean;

  @Action("updateUser", { namespace }) updateUser: any;

  currentUser: any = null;

  public created(): void {
    netlifyIdentity.init({});
  }

  @Watch("$route", { immediate: true, deep: true })
  onUrlChange(newVal: any) {
    this.isOpen = false;
  }

  public triggerNetlifyIdentityAction(action: any) {
    if (action == "login" || action == "signup") {
      netlifyIdentity.open(action);
      netlifyIdentity.on(action, (user: any) => {
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
        netlifyIdentity.close();
      });
    } else if (action == "logout") {
      this.currentUser = null;
      this.updateUser({
        currentUser: this.currentUser
      });
      netlifyIdentity.logout();
      this.$router.push({ name: "home" });
    }
  }
}
</script>

<style scoped>
.router-link-exact-active {
  background-color: #fafafa;
  color: #3273dc;
}
@media screen and (min-width: 1025px) {
  .navbar-item.is-hoverable:hover .navbar-dropdown {
    display: block !important;
  }
  .navbar-item.is-hoverable:focus-within .navbar-dropdown {
    display: none;
  }
}
</style>
