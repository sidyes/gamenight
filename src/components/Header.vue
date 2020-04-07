<template>
  <nav class="navbar has-shadow">
    <div class="container">
      <div class="navbar-brand">
        <a href="/" class="navbar-item">
          <img src="@/assets/logo.svg" width="50" alt="game-night" />

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
            <a class="navbar-link" aria-label="Spieleübersicht">Spiele</a>

            <div class="navbar-dropdown">
              <router-link to="/marco-polo" class="navbar-item"
                >Marco Polo</router-link
              >
              <router-link to="/wingspan" class="navbar-item"
                >Flügelschlag</router-link
              >
              <router-link to="/terra-mystica" class="navbar-item"
                >Terra Mystica</router-link
              >
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons" v-if="!isLoggedIn">
              <a
                class="button is-light"
                @click="login(login)"
                aria-label="Logge dich bei game-night ein"
                >Einloggen</a
              >
            </div>
            <div
              class="navbar-item has-dropdown is-hoverable"
              v-if="isLoggedIn"
            >
              <a class="navbar-link" aria-label="User Menü">
                <font-awesome-icon :icon="['fas', 'user']" class="mr-10" />
                {{ user.username }}
              </a>

              <div class="navbar-dropdown">
                <router-link to="/profile" class="navbar-item"
                  >Profil</router-link
                >
                <a
                  class="navbar-item has-text-danger"
                  @click="logout()"
                  aria-label="Ausloggen"
                  >Logout</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue, Watch, Emit, Prop } from "vue-property-decorator";
import netlifyIdentity from "netlify-identity-widget";

import { Getter, Action } from "vuex-class";

const axios = require("axios");

const namespace: string = "user";

@Component
export default class Header extends Vue {
  isOpen = false;

  @Prop({ default: false }) isLoggedIn!: boolean;
  @Prop({ default: undefined }) user: any;

  @Action("updateUser", { namespace }) updateUser: any;

  @Watch("$route", { immediate: true, deep: true })
  onUrlChange(newVal: any) {
    this.isOpen = false;
  }

  @Emit() login(): boolean {
    this.isOpen = false;
    return true;
  }

  @Emit() logout(): boolean {
    this.isOpen = false;
    return true;
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
