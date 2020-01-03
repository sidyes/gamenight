<template>
  <div>
    <apexchart
      width="100%"
      height="250"
      type="bar"
      :options="generateOptions()"
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

  public generateOptions(): any {
    return {
      ...this.options,
      xaxis: {
        ...this.options.xaxis,
        categories: this.categories
      }
    };
  }

  options = {
    title: {
      text: this.title,
      align: "center"
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
        breakpoint: 768,
        options: {
          chart: {
            width: 400
          },
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

    xaxis: {
      type: "category",
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5
          }
        }
      },
      categories: this.categories
    },
    fill: {
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [50, 0, 100, 100]
      }
    },
    theme: {
      mode: "dark",
      palette: "palette10"
    }
  };
}
</script>
