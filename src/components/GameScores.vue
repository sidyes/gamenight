<template>
  <div>
    <apexchart
      type="bar"
      height="250"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { GameScoreItem } from "@/models";

@Component
export default class GameScores extends Vue {
  series: any[] = [];

  chartOptions: any = {
    title: {
      text: "Scores",
      align: "center",
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -40,
    },
    xaxis: {
      min: 0,
    },
    tooltip: {
      show: false,
    },
  };

  @Prop({ default: () => [] }) data!: GameScoreItem[];

  @Watch("data", { immediate: true })
  dataChanged(data: GameScoreItem[]) {
    this.chartOptions = {
      ...this.chartOptions,
      dataLabels: {
        ...this.chartOptions.dataLabels,
        formatter: (val: string, { dataPointIndex }: any) => {
          return data[dataPointIndex].player;
        },
      },
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: data.map((el) => el.category),
      },
    };

    this.series = [
      {
        name: "Anzahl",
        data: data.map((el) => el.count),
      },
    ];
  }
}
</script>

<style scoped></style>
