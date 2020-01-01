<template>
  <div>Eazy</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { Member, MarcoPoloGame } from "@/models";

@Component
export default class MarcoPoloDetail extends Vue {
  @Getter("getGamesLoaded", { namespace: "marcoPolo" })
  gamesLoaded!: boolean;
  @Getter("getGame", { namespace: "marcoPolo" })
  getGameByTime!: (time: number) => MarcoPoloGame;

  @Getter("getUser", { namespace: "user" }) user!: Member;

  @Action("fetchGames", { namespace: "marcoPolo" }) fetchGames: any;

  @Prop({ default: 0 })
  id!: number;

  @Watch("gamesLoaded", { immediate: true, deep: true })
  onGamesLoadedChange(newVal: boolean) {
    if (newVal) {
      this.getGameByTime(this.id);
    }
  }

  public created(): void {
    if (!this.gamesLoaded) {
      this.fetchGames(this.user);
    }
  }
}
</script>
