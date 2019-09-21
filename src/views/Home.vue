<template>
  <div class="home">
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img class="is-rounded" src="@/assets/img/marco_polo.png" />
            </figure>
            <router-link
              tag="button"
              class="button is-primary mt-25"
              to="marco-polo"
              >Marco Polo</router-link
            >
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>
              Coming soon...
            </button>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>
              Coming soon...
            </button>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>
              Coming soon...
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class Home extends Vue {}
</script>
