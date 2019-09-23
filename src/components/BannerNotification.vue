<template>
  <div class="columns" v-if="show">
    <div class="column is-full">
      <div class="notification" v-bind:class="[color]">
        <button class="delete" @click="show = !show"></button>
        {{message}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class BannerNotification extends Vue {
  @Prop({ default: "" }) color!: string;
  @Prop({ default: "" }) message!: string;

  public show = true;
}
</script>
