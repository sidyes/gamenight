<template>
  <div>
    <table class="table is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th v-for="header in headings" v-bind:key="header.label">{{ header.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(elem, idxRow) in data" @click="rowClicked(idxRow)" v-bind:key="idxRow">
          <td v-for="n in headings.length" v-bind:key="n">{{ elem[headings[n - 1].key] }}</td>
        </tr>
      </tbody>
    </table>
    <p
      v-if="!data.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >No Data Available.</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";
import { ResultTableHeading } from "@/models";

@Component
export default class ResultTable extends Vue {
  @Prop({ default: () => [] }) headings!: ResultTableHeading[];
  @Prop({ default: () => [] }) data!: any[];

  @Emit() rowClicked(row: number) {
    return row;
  }
}
</script>

<style scoped>
tbody tr {
  cursor: pointer;
}
</style>
