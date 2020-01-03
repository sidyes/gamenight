import { Series } from "./series.model";

export class StackedColumChartData {
  constructor(public categories: string[], public series: Series[]) {}
}
