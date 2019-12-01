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
      text: "Scores",
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
      offsetX: -40,
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
    },
    theme: {
      mode: "dark",
      palette: "palette10"
    }
  };

  public generateSeries(): any {
    return [
      {
        name: "Anzahl",
        data: this.data.map(el => el.count)
      }
    ];
  }
}
</script>

<style scoped></style>
