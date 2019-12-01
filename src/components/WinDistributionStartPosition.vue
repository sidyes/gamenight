<template>
  <div>
    <apexchart width="380" height="250" type="pie" :options="generateOptions()" :series="wins"></apexchart>
    <p
      v-if="!positions.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >Noch keine Daten vorhanden.</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class WinDistributionStartPosition extends Vue {
  @Prop({ default: () => [] }) wins!: number[];
  @Prop({ default: () => [] }) positions!: string[];

  options = {
    title: {
      text: "Gewinnverteilung - Startposition"
    },
    chart: {
      width: 380,
      type: "pie"
    },
    labels: this.positions,
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
    ],
    theme: {
      mode: "dark",
      palette: "palette10"
    }
  };

  public generateOptions(): any {
    return {
      ...this.options,
      labels: this.positions,
      legend: {
        show: this.positions.length
      },
      tooltip: {
        enabled: this.positions.length
      }
    };
  }
}
</script>
