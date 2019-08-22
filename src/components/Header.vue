<template>
  <nav class="navbar has-shadow is-spaced">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://bulma.io">
          <img src="@/assets/logo.svg" width="50" />

          <p class="has-text-weight-semibold">GameNight</p>
        </a>

        <a
          role="button"
          class="navbar-burger burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarMenu"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarMenu" class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item">Home</a>
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
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Header extends Vue {}
</script>
