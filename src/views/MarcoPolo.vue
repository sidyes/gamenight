<template>
  <div class="marco-polo">
    <section class="section">
      <div class="container">
        <nav class="level">
          <!-- Left side -->
          <div class="level-left">
            <div class="level-item">
              <p class="subtitle is-5">
                <a class="button is-medium">Change Game</a>
              </p>
            </div>
          </div>

          <!-- Right side -->
          <div class="level-right">
            <p class="level-item">
              <a
                class="button is-medium is-success"
                @click="newGameActive = !newGameActive"
                :disabled="newGameActive"
              >New Game</a>
            </p>
          </div>
        </nav>

        <div class="columns" v-if="newGameActive">
          <div
            class="column is-6-fullhd is-8-desktop is-8-tablet is-offset-3-fullhd is-offset-2-desktop is-offset-2-tablet"
          >
            <div class="box">
              <form @submit.prevent="handleSubmit">
                <div class="field">
                  <label class="label">Number of players</label>
                  <div class="control">
                    <div class="select" @change="onNrOfPlayersChange($event)">
                      <select v-model="selectedNrOfPlayers">
                        <option
                          v-for="player in nrOfPlayers"
                          :value="player"
                          v-bind:key="player"
                        >{{ player }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="table-container">
                  <table class="table is-fullwidth">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Character</th>
                        <th>Points</th>
                        <th>Placement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="player in players" v-bind:key="player.email">
                        <td>
                          <div class="control">
                            <div class="select">
                              <select v-model="player.username">
                                <option
                                  v-for="mem in members"
                                  :value="mem.username"
                                  v-bind:key="mem.email"
                                >{{ mem.username }}</option>
                              </select>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="control">
                            <div class="select">
                              <select v-model="player.character">
                                <option
                                  v-for="char in characters"
                                  :value="char"
                                  v-bind:key="char"
                                >{{ char }}</option>
                              </select>
                            </div>
                          </div>
                        </td>
                        <td>
                          <input
                            class="input"
                            type="number"
                            min="0"
                            max="200"
                            v-model="player.points"
                            @change="onPointsChange($event)"
                          />
                        </td>
                        <td>
                          <p>{{ player.placement | placement }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="field is-grouped">
                  <div class="control">
                    <button class="button is-link" :disabled="!isFormComplete()">Save</button>
                  </div>
                  <div class="control">
                    <button class="button is-text" @click.prevent="newGameActive = false">Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { Member } from "@/models/member.model";
import { MarcoPoloPlayer, MarcoPoloGame } from "@/models/marco-polo.model";

const axios = require("axios");

@Component({
  components: {}
})
export default class MarcoPolo extends Vue {
  @Action("fetchMembers", { namespace: "user" }) fetchMembers: any;

  @Getter("getMembers", { namespace: "user" }) members!: Member[];

  nrOfPlayers = [2, 3, 4];
  selectedNrOfPlayers = "";

  players: MarcoPoloPlayer[] = [];

  characters = [
    "Berke Khan",
    "Johannes Caprini",
    "Kubilai Khan",
    "Matteo Polo",
    "Mercator ex Tabriz",
    "Niccolo und Marco Polo",
    "Wilhelm von Rubruk"
  ];

  newGameActive = false;

  public created(): void {
    this.fetchMembers();
  }

  public handleSubmit(): void {
    const game = new MarcoPoloGame(this.players, Date.now());
    axios
      .post("/.netlify/functions/marco-polo-create", game)
      .then((response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.selectedNrOfPlayers = "";
      });
  }

  public isFormComplete(): boolean {
    if (this.players.length === 0) {
      return false;
    }

    let valid = true;

    this.players.forEach(pl => {
      if (!pl.username || !pl.character || !pl.points || !pl.placement) {
        valid = false;
      }
    });

    return valid;
  }

  public onNrOfPlayersChange(event: any): void {
    this.players = [];
    for (let i = 0; i < event.target.value; i++) {
      const player = ({
        name: "",
        character: "",
        points: undefined,
        placement: undefined
      } as any) as MarcoPoloPlayer;
      this.players.push(player);
    }
  }

  public onPointsChange(event: any): void {
    this.players.forEach(pl => {
      pl.placement = this.getPlacement(pl);
    });
  }

  private getPlacement(player: any): number | undefined {
    if (!player.points) {
      return undefined;
    }
    let placement = 1;
    this.players.forEach(pl => {
      if (pl !== player && +player.points < (+pl.points || 0)) {
        placement++;
      }
    });

    return placement;
  }
}
</script>
