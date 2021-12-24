<template>
  <div class="table-wrapper">
    <table class="table is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th
            v-for="header in headings"
            v-bind:key="header.label"
            class="has-text-white has-text-weight-light"
          >
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(elem, idxRow) in data"
          v-bind:key="idxRow"
          @click="rowClicked(idxRow)"
        >
          <td v-for="n in headings.length" v-bind:key="n">
            {{ elem[headings[n - 1].key] }}
          </td>
        </tr>
      </tbody>
    </table>
    <p
      v-if="!data.length"
      class="has-text-warning has-text-centered is-italic has-text-weight-medium"
    >
      Keine Daten vorhanden.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator";
import { TableHeading } from "@/models";

@Component
export default class Table extends Vue {
  @Prop({ default: () => [] }) headings!: TableHeading[];
  @Prop({ default: () => [] }) data!: any[];

  @Emit() rowClicked(row: number) {
    return row;
  }
}
</script>

<style scoped>
.table-wrapper {
  max-height: 450px;
  overflow-y: auto;
}
thead th {
  position: sticky;
  top: 0;
  background-color: #343f57;
}
tbody tr {
  cursor: pointer;
}
</style>
