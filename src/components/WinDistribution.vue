<template>
  <apexchart
    width="380"
    height="250"
    type="pie"
    :options="generateOptions()"
    :series="wins"
  ></apexchart>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class WinDistribution extends Vue {
  @Prop({ default: () => [] }) wins!: number[];
  @Prop({ default: () => [] }) players!: string[];

  options = {
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
            width: 200
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
      labels: this.players
    };
  }
}
</script>
