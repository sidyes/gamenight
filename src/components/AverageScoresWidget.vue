<template>
  <div>
    <apexchart
      type="line"
      height="250"
      :options="generateOptions()"
      :series="generateSeries()"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { AverageScores } from "@/models";

@Component
export default class AverageScoresWidget extends Vue {
  @Prop() data!: AverageScores;

  public generateOptions(): any {
    return {
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
        categories: this.data.players.map((el) => el.username),
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
      },
      tooltip: {
        y: {
          formatter: (val: string, _opts: any) => {
            return val;
          },
        },
      },
    };
  }

  public generateSeries(): any {
    return [
      {
        name: "Durchschnitt Spieler",
        type: "column",
        data: this.data.players.map((el) => el.average),
      },
      {
        name: "Durchschnitt Gesamt",
        type: "line",
        data: this.data.players.map((_) => this.data.totalAverage),
      },
    ];
  }
}
</script>

<style scoped></style>
