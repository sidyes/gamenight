<template>
  <div>
    <apexchart
      width="100%"
      height="250"
      type="bar"
      :options="options"
      :series="series"
    ></apexchart>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Series } from "@/models";

@Component
export default class GamesOverTime extends Vue {
  @Prop({ default: () => [] }) series!: Series[];

  public created(): void {
    this.options = {
      ...this.options,
      xaxis: {
        ...this.options.xaxis,
        categories: this.generateLastYear(),
      },
    };
  }

  options = {
    title: {
      text: "Spiele in den letzten 12 Monaten",
      align: "center",
    },
    chart: {
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
      formatter: function (val: number) {
        return val > 0 ? "#" + val : "";
      },
      offsetY: 10,
      style: {
        fontSize: "12px",
        colors: ["#ffffff"],
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            width: 400,
          },
        },
      },
    ],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        fill: {
          type: "gradient",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
      },
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
        stops: [50, 0, 100, 100],
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
  };

  monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  public generateLastYear(): string[] {
    const today = new Date();
    let d, month;

    let series = [];

    for (let i = 11; i >= 0; i -= 1) {
      d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      month = this.monthNames[d.getMonth()];

      series.push(month);
    }

    return series;
  }
}
</script>
