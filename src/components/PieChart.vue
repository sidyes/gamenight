<template>
  <div>
    <apexchart
      ref="pieChart"
      width="380"
      height="250"
      type="pie"
      :options="options"
      :series="activeSeries"
    ></apexchart>
    <p
      v-if="!labels.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >
      Keine Daten vorhanden.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class PieChart extends Vue {
  @Prop({ default: () => [] }) series!: number[];
  @Prop({ default: () => [] }) labels!: string[];
  @Prop({ default: () => "Verteilung" }) title!: string;

  activeSeries: number[] = [];
  options: any = {
    title: {
      text: this.title,
    },
    chart: {
      width: 380,
      type: "pie",
    },
    labels: [],
    responsive: [
      {
        breakpoint: 768,
        options: {
          title: {
            align: "center",
          },
          dataLabels: {
            offsetX: 100,
          },
          chart: {
            width: 350,
            type: "pie",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  @Watch("labels", { immediate: true })
  labelsChanged(labels: string[]) {
    this.options = {
      ...this.options,
      labels: labels,
      legend: {
        show: labels.length,
        position: "right",
      },
      tooltip: {
        enabled: this.labels.length,
      },
    };
  }

  @Watch("series", { immediate: true })
  seriesChanged(series: number[]) {
    console.log(series)
    this.activeSeries = series;
  }
}
</script>
