<template>
  <div>Eazy</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class MarcoPoloDetail extends Vue {
  // @Prop({ default: 0 }) id!: number;

  // @Getter("getGamesLastYear", { namespace: "marcoPolo" })
  // gamesOverTime!: Series[];

  public created(): void {
    console.log(this.$route);
  }
}
</script>
