<template>
  <div class="ark-nova-detail">
    <section class="hero is-primary" v-if="gameFound">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-one-fifth">
              <figure class="image is-128x128 has-image-centered">
                <img
                  class="is-rounded"
                  src="@/assets/img/ark-nova/arche-nova.webp"
                  alt="Arche Nova"
                />
              </figure>
            </div>
            <div class="column is-three-fifths">
              <h1 class="title">{{ new Date(game.time).toDateString() }}</h1>
              <h2 class="subtitle">
                🏠 {{ game.location }} // ⌛ {{ timePlayed }}
              </h2>
            </div>
            <div class="column has-text-right">
              <router-link
                tag="button"
                class="button is-outlined is-link"
                to="/ark-nova"
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
          :message="`Es wurde kein Spiel mit der ID ${time} (${new Date(
            time
          ).toDateString()}) gefunden.`"
        ></banner-notification>
        <div class="columns is-multiline" v-if="gameFound">
          <div
            class="column is-half"
            v-for="(player, idx) in game.players"
            v-bind:key="idx"
          >
            <div
              class="box border"
              v-bind:class="{
                gold: player.placement === 1,
                silver: player.placement === 2,
                bronze: player.placement === 3,
              }"
            >
              <div class="columns">
                <div class="column is-half">
                  <figure class="image is-3by4">
                    <img
                      v-bind:src="
                        require(`@/assets/img/ark-nova/${zooMapToImage(
                          player.zooMap
                        )}.jpg`)
                      "
                      v-bind:alt="player.zooMap"
                    />
                  </figure>
                </div>
                <div class="column is-half has-text-centered">
                  <h2 class="title is-6 has-text-white">
                    {{ player.user.username }}
                  </h2>
                  <p class="has-text-white is-size-7">
                    Gesamt<br />
                    <span class="title is-2 has-text-white">{{
                      player.points
                    }}</span>
                  </p>

                  <div class="columns mt-30 is-multiline is-mobile">
                    <div class="column is-half">
                      <p class="has-text-white is-size-7">
                        Attraktivitätspunkte<br />
                        <span class="title is-2 has-text-white">{{
                          player.appealPoints
                        }}</span>
                      </p>
                    </div>
                    <div class="column is-half">
                      <p class="has-text-white is-size-7">
                        Zielwert<br />
                        <span class="title is-2 has-text-white">{{
                          player.appealPointsCompare
                        }}</span>
                      </p>
                    </div>
                    <div class="column is-half">
                      <p class="has-text-white is-size-7">
                        Artenschutzpunkte<br />
                        <span class="title is-2 has-text-white">{{
                          player.conservationPoints
                        }}</span>
                      </p>
                    </div>
                    <div class="column is-half">
                      <p class="has-text-white is-size-7">
                        Startposition<br />
                        <span class="title is-2 has-text-white">{{
                          player.startPosition
                        }}</span>
                      </p>
                    </div>
                    <div class="column is-full">
                      <p class="has-text-white is-size-7">
                        Zoo vollständig bebaut<br />
                        <span class="title is-2 has-text-white">{{
                          player.zooMapFull ? "✅" : "❌"
                        }}</span>
                      </p>
                    </div>
                  </div>
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
import { Member, ArkNovaGame } from "@/models";

import { getTimePlayed } from "@/store/shared";

@Component
export default class ArkNovaDetail extends Vue {
  public game!: ArkNovaGame;
  public gameFound = false;
  public timePlayed!: string;

  @Getter("getTimePlayed", { namespace: "arkNova" }) avgTime!: string;
  @Getter("getGamesLoaded", { namespace: "arkNova" })
  gamesLoaded!: boolean;
  @Getter("getGame", { namespace: "arkNova" })
  getGameByTime!: (time: number) => ArkNovaGame;

  @Getter("getUser", { namespace: "user" }) user!: Member;

  @Action("fetchGames", { namespace: "arkNova" }) fetchGames: any;

  @Prop({ default: 0 })
  time!: number;

  @Watch("gamesLoaded", { immediate: true, deep: true })
  onGamesLoadedChange(newVal: boolean) {
    if (newVal) {
      this.game = this.getGameByTime(this.time);
      this.gameFound = this.game ? true : false;
      this.timePlayed = getTimePlayed([this.game]);
    }
  }

  public created(): void {
    if (!this.gamesLoaded) {
      this.fetchGames(this.user);
    }
  }

  public zooMapToImage(zooMap: string): string {
    return zooMap.replace("Plan ", "");
  }
}
</script>
