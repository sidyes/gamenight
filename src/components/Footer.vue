<template>
  <footer class="footer">
    <div class="content has-text-centered">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <router-link to="/imprint" class="navbar-item">Impressum</router-link>
        </div>
        <div class="column is-narrow">
          <router-link to="/data-privacy" class="navbar-item">Datenschutzerklärung</router-link>
        </div>
      </div>
      <div></div>
      <p>
        <strong>GameNight</strong> - Play. Track. Repeat.
      </p>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Footer extends Vue {}
</script>
