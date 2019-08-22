<template>
  <div class="home">
    <div class="columns">
      <div class="column has-text-centered">
        <figure class="image is-200x200 has-image-centered">
          <img class="is-rounded" src="@/assets/img/marco_polo.png" />
        </figure>
        <a class="button is-primary mt-25">Marco Polo</a>
      </div>
      <div class="column">Second column</div>
      <div class="column">Third column</div>
      <div class="column">Fourth column</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

@Component({
  components: {}
})
export default class Home extends Vue {}
</script>
