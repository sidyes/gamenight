<template>
  <div>
    <apexchart type="line" height="250" :options="options" :series="series" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { AverageScores } from "@/models";

@Component
export default class AverageScoresWidget extends Vue {
  @Prop() data!: AverageScores;

  series: any[] = [];
  options: any = {
    title: {
      text: "Durchschnittliche Punktzahl",
      align: "center",
    },
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
    },
    xaxis: {
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: function (value: number) {
          return value.toFixed(0);
        },
      },
    },

    legend: {
      offsetY: 5,
      onItemClick: {
        toggleDataSeries: false,
      },
    },
    tooltip: {
      y: {
        formatter: (val: string, _opts: any) => {
          return val;
        },
      },
    },
  };

  @Watch("data", { immediate: true })
  dataChanged(data: AverageScores) {
    this.options = {
      ...this.options,
      xaxis: {
        ...this.options.xaxis,
        categories: data.players.map((el) => el.username),
      },
    };

    this.series = [
      {
        name: "Durchschnitt Spieler",
        type: "column",
        data: data.players.map((el) => el.average),
      },
      {
        name: "Durchschnitt Gesamt",
        type: "line",
        data: data.players.map((_) => data.totalAverage),
      },
    ];
  }
}
</script>

<style scoped></style>
