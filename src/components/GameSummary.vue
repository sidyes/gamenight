<template>
  <nav class="level">
    <div
      class="level-item has-text-centered"
      v-for="item in items"
      v-bind:key="item.label"
    >
      <div>
        <p class="heading">{{ item.label }}</p>
        <p class="title">{{ item.value }}</p>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GameSummaryItem } from "@/models";

@Component
export default class GameSummary extends Vue {
  @Prop({ default: () => [] }) items!: GameSummaryItem[];
}
</script>

<style scoped></style>
