<template>
  <div class="modal" v-bind:class="{ 'is-active': isOpened }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
        <button class="delete" aria-label="close" @click="closed"></button>
      </header>
      <section class="modal-card-body">
        <div class="columns">
          <div class="column is-one-third-desktop is-one-third-tablet">
            <div class="field">
              <label class="label">Anzahl Spieler</label>
              <div class="control">
                <div class="select" @change="playersChanged($event)">
                  <select v-model="selectedNrOfPlayers">
                    <option
                      v-for="player in nrOfPlayers"
                      :value="player"
                      v-bind:key="player"
                    >
                      {{ player }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div
            class="column is-one-third-desktop is-one-third-tablet is-offset-one-third-tablet is-offset-one-third-desktop"
          >
            <div class="field">
              <label class="label">Ort</label>
              <div class="control has-icons-left">
                <div class="select" @change="locationChanged($event)">
                  <select v-model="selectedLocation">
                    <option
                      v-for="loc in locationOptions"
                      :value="loc"
                      v-bind:key="loc"
                    >
                      {{ loc }}
                    </option>
                  </select>
                </div>
                <span class="icon is-left">
                  <font-awesome-icon :icon="['fas', 'home']" />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="columns">
          <div class="column is-narrow">
            <div class="field">
              <label class="label">Spielzeit (in Minuten)</label>
              <p class="control has-icons-left">
                <input
                  class="input"
                  type="number"
                  min="0"
                  max="450"
                  @change="timeChanged($event)"
                />
                <span class="icon is-small is-left">
                  <font-awesome-icon :icon="['fas', 'hourglass']" />
                </span>
              </p>
            </div>
          </div>
        </div>

        <slot v-if="selectedNrOfPlayers">
          <!-- Add Game-Specific Table / Controls here -->
        </slot>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          :disabled="disableSaveBtn"
          @click="gameSaved"
        >
          Spiel speichern
        </button>
        <button class="button" @click="closed">Abbrechen</button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Member } from "@/models";
import { Component, Vue, Emit, Prop, Watch } from "vue-property-decorator";

@Component
export default class NewGameModal extends Vue {
  @Prop({ default: false }) isOpened!: boolean;
  @Prop({ default: () => [] }) players!: Member[];
  @Prop({ default: "" }) title!: string;
  @Prop({ default: "" }) location!: string;
  @Prop({ default: () => [2, 3, 4] }) nrOfPlayers!: number[];
  @Prop({ default: true }) disableSaveBtn!: boolean;

  selectedNrOfPlayers = "4";
  selectedLocation = "";

  locationOptions: string[] = [];

  @Watch("players", { immediate: true, deep: true })
  onPlayersInputChange(newVal: Member[]) {
    if (newVal) {
      this.locationOptions = [
        ...newVal.map((member) => member.username),
        "BGA",
      ];
    }
  }

  @Emit() playersChanged(event: any): number {
    return event.target.value;
  }

  @Emit() locationChanged(event: any): string {
    return event.target.value;
  }

  @Emit() timeChanged(event: any): number {
    return event.target.value;
  }

  @Emit() gameSaved(): boolean {
    this.selectedNrOfPlayers = "";
    return true;
  }

  @Emit() closed(): boolean {
    return true;
  }

  public mounted(): void {
    this.playersChanged({ target: { value: this.selectedNrOfPlayers } });
  }
}
</script>
