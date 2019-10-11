<template>
  <div>
    <apexchart
      width="380"
      height="250"
      type="pie"
      :options="generateOptions()"
      :series="wins"
    ></apexchart>
    <p
      v-if="!players.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >
      Noch keine Daten vorhanden.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class WinDistribution extends Vue {
  @Prop({ default: () => [] }) wins!: number[];
  @Prop({ default: () => [] }) players!: string[];

  options = {
    title: {
      text: "Win Distribution"
    },
    chart: {
      width: 380,
      type: "pie"
    },
    labels: this.players,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  };

  public generateOptions(): any {
    return {
      ...this.options,
      labels: this.players,
      legend: {
        show: this.players.length
      },
      tooltip: {
        enabled: this.players.length
      }
    };
  }
}
</script>
