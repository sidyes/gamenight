<template>
  <apexchart type="bar" height="250" :options="chartOptions" :series="series" />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { GameScoreItem } from "@/models";

@Component
export default class GameScores extends Vue {
  data = [
    new GameScoreItem("Top Score", 102, "Stefan"),
    new GameScoreItem("Highest Losing Score", 53, "Hannes"),
    new GameScoreItem("Avg Score", 48, "Hannes"),
    new GameScoreItem("Lowest Score", 26, "Xtos"),
    new GameScoreItem("Lowest Win Score", 47, "Cpt")
  ];

  series = [
    {
      name: "Count",
      data: this.data.map(el => el.count)
    }
  ];
  chartOptions = {
    title: {
      text: "Game Scores",
      floating: true,
      offsetY: 232,
      align: "center",
      style: {
        color: "#363636"
      }
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
}
</script>

<style scoped></style>
