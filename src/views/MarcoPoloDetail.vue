<template>
  <div class="marco-polo-detail">
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
            {{ player.user.username }}
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
}
</script>
