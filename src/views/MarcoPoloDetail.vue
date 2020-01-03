<template>
  <div class="marco-polo-detail">
    <section class="hero is-primary" v-if="gameFound">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-one-fifth">
              <figure class="image is-128x128 has-image-centered">
                <img
                  class="is-rounded"
                  src="@/assets/img/marco-polo/marco_polo.png"
                  alt="Marco Polo"
                />
              </figure>
            </div>
            <div class="column is-three-fifths">
              <h1 class="title">{{ new Date(game.time).toDateString() }}</h1>
              <h2 class="subtitle">🏠 {{ game.location }}</h2>
            </div>
            <div class="column has-text-right">
              <router-link
                tag="button"
                class="button is-outlined is-link"
                to="/marco-polo"
                >Übersicht</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <banner-notification
          v-if="!gameFound"
          :color="'is-danger'"
          :message="
            `Es wurde kein Spiel mit der ID ${time} (${new Date(
              time
            ).toDateString()}) gefunden.`
          "
        ></banner-notification>
        <div class="columns" v-if="gameFound">
          <div
            class="column"
            v-for="(player, idx) in game.players"
            v-bind:key="idx"
          >
            <div
              class="box border"
              v-bind:class="{
                gold: player.placement === 1,
                silver: player.placement === 2,
                bronze: player.placement === 3
              }"
            >
              <div class="columns">
                <div class="column is-half">
                  <figure class="image is-3by4">
                    <img
                      v-bind:src="
                        require(`@/assets/img/marco-polo/${characterToImage(
                          player.character
                        )}.png`)
                      "
                      v-bind:alt="player.character"
                    />
                  </figure>
                </div>
                <div class="column is-half has-text-centered">
                  <h2 class="title is-6 has-text-white">
                    {{ player.user.username }}
                  </h2>
                  <p class="has-text-white is-size-7">
                    Punkte<br />
                    <span class="title is-2 has-text-white">{{
                      player.points
                    }}</span>
                  </p>
                  <p class="has-text-white is-size-7">
                    Startposition<br />
                    <span class="title is-2 has-text-white">{{
                      player.startPosition
                    }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { Member, MarcoPoloGame } from "@/models";

import * as _ from "lodash";

@Component
export default class MarcoPoloDetail extends Vue {
  public game!: MarcoPoloGame;
  public gameFound = false;

  @Getter("getGamesLoaded", { namespace: "marcoPolo" })
  gamesLoaded!: boolean;
  @Getter("getGame", { namespace: "marcoPolo" })
  getGameByTime!: (time: number) => MarcoPoloGame;

  @Getter("getUser", { namespace: "user" }) user!: Member;

  @Action("fetchGames", { namespace: "marcoPolo" }) fetchGames: any;

  @Prop({ default: 0 })
  time!: number;

  @Watch("gamesLoaded", { immediate: true, deep: true })
  onGamesLoadedChange(newVal: boolean) {
    if (newVal) {
      this.game = this.getGameByTime(this.time);
      this.gameFound = this.game ? true : false;
    }
  }

  public created(): void {
    if (!this.gamesLoaded) {
      this.fetchGames(this.user);
    }
  }

  public characterToImage(char: string): string {
    return _.snakeCase(char);
  }
}
</script>
