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
          v-bind:class="{'is-active': isOpen}"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarMenu" class="navbar-menu" v-bind:class="{'is-active': isOpen}">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item" @click="isOpen = !isOpen">Home</router-link>

          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link">Games</a>

            <div class="navbar-dropdown">
              <router-link to="/marco-polo" class="navbar-item">Marco Polo</router-link>
            </div>
          </div>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-primary">
                <strong>Sign up</strong>
              </a>
              <a class="button is-light">Log in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class Header extends Vue {
  isOpen = false;

  @Watch("$route", { immediate: true, deep: true })
  onUrlChange(newVal: any) {
    this.isOpen = false;
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