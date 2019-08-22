<template>
  <div class="home">
    <div class="columns">
      <div class="column has-text-centered">
        <figure class="image is-200x200 has-image-centered">
          <img class="is-rounded" src="@/assets/img/marco_polo.png" />
        </figure>
        <router-link tag="button" class="button is-primary mt-25" to="marco-polo">Marco Polo</router-link>
      </div>
      <div class="column">Second column</div>
      <div class="column">Third column</div>
      <div class="column">Fourth column</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class Home extends Vue {}
</script>
