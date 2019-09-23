<template>
  <div>
    <apexchart type="bar" height="250" :options="chartOptions" :series="generateSeries()" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { GameScoreItem } from "@/models";

@Component
export default class GameScores extends Vue {
  @Prop({ default: () => [] }) data!: GameScoreItem[];

  chartOptions = {
    title: {
      text: "Game Scores",
      align: "center"
    },
    chart: {
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: "top"
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetX: -15,
      formatter: (val: string, { dataPointIndex }: any) => {
        return this.data[dataPointIndex].player;
      }
    },
    xaxis: {
      categories: this.data.map(el => el.category),
      min: 0
    },
    tooltip: {
      show: false
    }
  };

  public generateSeries(): any {
    return [
      {
        name: "Count",
        data: this.data.map(el => el.count)
      }
    ];
  }
}
</script>

<style scoped></style>
