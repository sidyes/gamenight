<template>
  <div>
    <apexchart
      width="100%"
      height="250"
      type="bar"
      :options="options"
      :series="series"
    ></apexchart>
    <p
      v-if="!categories.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >
      Keine Daten vorhanden.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Series } from "@/models";

@Component
export default class StackedColumnChart extends Vue {
  @Prop({ default: () => [] }) series!: Series[];
  @Prop({ default: () => [] }) categories!: string[];
  @Prop({ default: () => "Stacked Bar Chart" }) title!: string;

  public created(): void {
    this.options = {
      ...this.options,
      xaxis: {
        ...this.options.xaxis,
        categories: this.categories
      }
    };
  }

  options = {
    title: {
      text: this.title
    },
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false
      }
    },
    legend: {
      position: "right",
      offsetY: 40
    },
    fill: {
      opacity: 1
    },
    xaxis: {}
  };
}
</script>
