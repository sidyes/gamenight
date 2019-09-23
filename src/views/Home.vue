<template>
  <div class="home">
    <div id="angles" class></div>
    <section class="hero is-medium">
      <div class="hero-body">
        <div class="container">
          <div class="columns">
            <div class="column is-6">
              <h2
                class="title is-2 is-family-sans-serif has-text-weight-bold has-text-white"
              >Play. Track. Repeat.</h2>
              <p
                class="has-text-white"
              >GameNight bietet dir die Möglichkeit deine Spieleabende für die Ewigkeit festzuhalten - Probiere es aus!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <router-link to="marco-polo">
                <img class="is-rounded" src="@/assets/img/marco_polo.png" />
              </router-link>
            </figure>
            <router-link tag="button" class="button is-primary mt-25" to="marco-polo">Marco Polo</router-link>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>Coming soon...</button>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>Coming soon...</button>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <img
                class="is-rounded"
                src="https://github.com/jgthms/bulma/blob/master/docs/images/placeholders/256x256.png?raw=true"
              />
            </figure>
            <button class="button is-primary mt-25" disabled>Coming soon...</button>
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

<style scoped>
.home {
  position: relative;
}

#angles {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: skewY(-12deg);
  transform-origin: 0;
  position: absolute;
  box-shadow: inset 0 -10px 80px -10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(150deg, #0000ff 15%, #3300ff 50%, #6600ff 94%);
}
</style>
