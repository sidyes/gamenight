<template>
  <div class="home">
    <div id="angles" class></div>
    <section class="hero is-medium">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-variable is-8">
            <div class="column is-6">
              <h2
                class="title is-2 is-family-sans-serif has-text-weight-bold has-text-white"
              >
                Play. Track. Repeat.
              </h2>

              <div class="column is-6 has-text-centered is-hidden-desktop">
                <transition
                  name="bounce"
                  enter-active-class="animated bounceInRight faster delay-1s"
                  v-on:after-enter="afterEnter"
                >
                  <figure
                    class="image is-128x128 has-image-centered"
                    v-if="showDice"
                    v-bind:class="[animationEnd]"
                  >
                    <img src="@/assets/logo.svg" alt="game-night" />
                  </figure>
                </transition>
              </div>

              <p class="has-text-white mt-25">
                GameNight bietet dir die Möglichkeit deine Spieleabende für die
                Ewigkeit festzuhalten - Probiere es aus!
              </p>
            </div>

            <div class="column is-6 has-text-centered is-hidden-touch">
              <transition
                name="bounce"
                enter-active-class="animated bounceInRight faster delay-1s"
                v-on:after-enter="afterEnter"
              >
                <figure
                  class="image is-128x128 has-image-centered"
                  v-if="showDice"
                  v-bind:class="[animationEnd]"
                >
                  <img src="@/assets/logo.svg" alt="game-night" />
                </figure>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section pt-0">
      <div class="container">
        <div class="columns">
          <div class="column">
            <h2 class="title is-2 has-text-white">Upcoming Events</h2>
            <h3 class="subtitle has-text-white">
              Wann wird wieder perfomt? 💥
            </h3>
          </div>
        </div>
        <div class="columns">
          <div class="column" v-if="nextEventsLoaded && nextEventInFuture">
            <next-game-event
              :nextEvent="nextEvent"
              :nextEventEntered="nextEventEntered"
            >
            </next-game-event>
          </div>
          <div class="column" v-else>
            <p class="has-text-warning is-italic has-text-weight-medium">
              -- Im Moment ist kein Spieleabend geplant <span>😰</span> --
            </p>
          </div>
        </div>
      </div>
    </section>
    <section class="section pt-0">
      <div class="container">
        <div class="columns">
          <div class="column">
            <h2 class="title is-2 has-text-white">Unsere Spiele</h2>
            <h3 class="subtitle has-text-white">
              Bald kommen mehr - versprochen! 🤞
            </h3>
          </div>
        </div>
        <div class="columns">
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <router-link to="marco-polo">
                <img
                  class="is-rounded"
                  src="@/assets/img/marco-polo/marco_polo.png"
                  alt="Marco Polo"
                />
              </router-link>
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
              <router-link to="wingspan">
                <img
                  class="is-rounded"
                  src="@/assets/img/wingspan/wingspan.jpg"
                  alt="Flügelschlag"
                />
              </router-link>
            </figure>
            <router-link
              tag="button"
              class="button is-primary mt-25"
              to="wingspan"
              >Flügelschlag</router-link
            >
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <router-link to="terra-mystica">
                <img
                  class="is-rounded"
                  src="@/assets/img/terra-mystica/terra-mystica.jpg"
                  alt="Terra Mystica"
                />
              </router-link>
            </figure>
            <router-link
              tag="button"
              class="button is-primary mt-25"
              to="terra-mystica"
            >
              Terra Mystica
            </router-link>
          </div>
          <div class="column has-text-centered">
            <figure class="image is-200x200 has-image-centered">
              <router-link to="ark-nova">
                <img
                  class="is-rounded is-200x200"
                  src="@/assets/img/ark-nova/arche-nova.webp"
                  alt="Arche Nova"
                />
              </router-link>
            </figure>
            <router-link
              tag="button"
              class="button is-primary mt-25"
              to="ark-nova"
            >
              Arche Nova
            </router-link>
          </div>
        </div>
      </div>
    </section>
    <section class="section pt-0">
      <div class="container">
        <div class="columns">
          <div class="column">
            <h2 class="title is-2 has-text-white">Unsere Partner</h2>
            <h3 class="subtitle has-text-white">
              Schaut auch mal bei Ihnen vorbei! 🙏
            </h3>
          </div>
        </div>
        <div class="columns">
          <div class="column">
            <article class="media">
              <figure class="media-left">
                <p class="image is-128x128">
                  <a href="https://brettspiel-empfehlungen.de/" target="_bank">
                    <img
                      src="@/assets/img/partner/brettspiel-empfehlungen-logo.jpg"
                      alt="Brettspiel Empfehlungen"
                    />
                  </a>
                </p>
              </figure>
              <div class="media-content">
                <div class="content">
                  <h5 class="title is-5 has-text-white">
                    Brettspiel Empfehlungen
                  </h5>
                  <p class="has-text-white">
                    Ausgewählte Spiele Reviews, Spieletests und Rezensionen von
                    Kinderspielen, Familienspielen, Kennerspielen und
                    Expertenspielen<br />
                  </p>
                  <nav class="level is-hidden-mobile">
                    <div class="level-left">
                      <div class="level-item">
                        <a
                          class="button is-primary"
                          href="https://brettspiel-empfehlungen.de/"
                          target="_bank"
                        >
                          Zur Webseite
                        </a>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
const axios = require("axios");

@Component({
  components: {},
})
export default class Home extends Vue {
  public showDice = false;
  public animationEnd = "";
  public nextEventsLoaded = false;
  public nextEventInFuture = false;

  public nextEvent!: number;
  public nextEventEntered!: number;

  public mounted(): void {
    this.showDice = true;

    this.loadNextEvents();
  }

  public loadNextEvents(): void {
    axios.get("/.netlify/functions/game-events-read").then((response: any) => {
      const evt = response.data.items[response.data.items.length - 1];
      this.nextEvent = evt.nextEvent;
      this.nextEventEntered = evt.nextEventEntered;
      this.nextEventsLoaded = true;
      this.nextEventInFuture = Date.now() <= this.nextEvent;
    });
  }

  public afterEnter(): void {
    this.animationEnd = "animated bounce";
  }
}
</script>

<style scoped>
.home {
  position: relative;
}

#angles {
  width: 100%;
  height: 80%;
  overflow: hidden;
  transform: skewY(-12deg);
  transform-origin: 0;
  position: absolute;
  box-shadow: inset 0 -10px 80px -10px rgba(0, 0, 0, 0.1);
  background: linear-gradient(150deg, #141922 15%, #242c3c 50%, #343f57 94%);
}
</style>
