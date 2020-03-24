<template>
  <div>
    <apexchart
      width="380"
      height="250"
      type="pie"
      :options="generateOptions()"
      :series="series"
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
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class PieChart extends Vue {
  @Prop({ default: () => [] }) series!: number[];
  @Prop({ default: () => [] }) labels!: string[];
  @Prop({ default: () => "Verteilung" }) title!: string;

  options = {
    title: {
      text: this.title,
    },
    chart: {
      width: 380,
      type: "pie",
    },
    labels: this.labels,
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
    theme: {
      mode: "dark",
      palette: "palette10",
    },
  };

  public generateOptions(): any {
    return {
      ...this.options,
      labels: this.labels,
      legend: {
        show: this.labels.length,
        position: "right",
      },
      tooltip: {
        enabled: this.labels.length,
      },
    };
  }
}
</script>
