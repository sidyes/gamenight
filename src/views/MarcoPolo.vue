<template>
  <div class="marco-polo">
    <section class="section">
      <new-game-modal
        :isOpened.sync="newGameActive"
        :title="'New Game'"
        :disableSaveBtn="!isFormComplete()"
        :location="location"
        @players-changed="onNrOfPlayersChange"
        @closed="newGameActive = false"
        @game-saved="saveGame"
        @location-changed="onLocationChange"
      >
        <div class="table-container">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Player</th>
                <th>Start Position</th>
                <th>Character</th>
                <th>Points</th>
                <th>Placement</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(player, idx) in players" v-bind:key="idx">
                <td>
                  <div class="control">
                    <div class="select">
                      <select v-model="player.user">
                        <option
                          v-for="mem in members"
                          :value="mem"
                          v-bind:key="mem.email"
                        >{{ mem.username }}</option>
                      </select>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="control">
                    <div class="select">
                      <select v-model="player.startPosition" @change="handleStartPositions(player)">
                        <option
                          v-for="position in players.length"
                          :value="position"
                          v-bind:key="position"
                        >{{ position }}</option>
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
      </new-game-modal>
      <div class="container">
        <div class="columns">
          <div class="column is-full">
            <div class="box">
              <div class="columns is-vcentered">
                <div class="column is-one-fifth">
                  <figure class="image is-128x128 has-image-centered">
                    <img class="is-rounded" src="@/assets/img/marco_polo.png" />
                  </figure>
                </div>
                <div class="column is-three-fifths">
                  <game-summary :items="gameSummaryItems"></game-summary>
                </div>
                <div class="column has-text-right">
                  <a
                    class="button is-medium is-success"
                    @click="newGameActive = !newGameActive"
                    :disabled="newGameActive"
                  >New Game</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-half">
            <div class="box">
              <game-scores></game-scores>
            </div>
          </div>
          <div class="column is-half">
            <div class="box">
              <games-over-time></games-over-time>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-half is-offset-one-quarter">
            <result-table @row-clicked="onRowClicked" :data="resultTable" :headings="headings"></result-table>
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
import { GameSummaryItem, ResultTableHeading } from "../models";

const axios = require("axios");
const toast = require("vuex-toast");

@Component({
  components: {}
})
export default class MarcoPolo extends Vue {
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];

  @Getter("getSummary", { namespace: "marcoPolo" })
  gameSummaryItems!: GameSummaryItem[];

  @Getter("getResultTable", { namespace: "marcoPolo" })
  resultTable!: any[];

  @Getter("getResultTableHeadings", { namespace: "marcoPolo" })
  headings!: ResultTableHeading[];

  @Getter("getCharacters", { namespace: "marcoPolo" })
  characters!: string[];

  players: MarcoPoloPlayer[] = [];

  location: string = "";

  newGameActive = false;

  public onRowClicked(row: number): void {
    console.log("clicked row", row);
  }

  public saveGame(): void {
    const game = new MarcoPoloGame(this.players, Date.now(), this.location);
    axios
      .post("/.netlify/functions/marco-polo-create", game)
      .then((response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";

        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Game saved",
          type: "success",
          dismissAfter: 2000
        });
      })
      .catch((err: any) => {
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Game could not be saved",
          type: "danger",
          dismissAfter: 1000
        });
      });
  }

  public isFormComplete(): boolean {
    if (this.players.length === 0) {
      return false;
    }

    let valid = true;

    this.players.forEach(pl => {
      if (
        !pl.user ||
        !pl.character ||
        !pl.points ||
        !pl.placement ||
        !pl.startPosition ||
        !this.location
      ) {
        valid = false;
      }
    });

    return valid;
  }

  public handleStartPositions(player: MarcoPoloPlayer): void {
    this.players.forEach(pl => {
      if (
        pl !== player &&
        pl.startPosition &&
        pl.startPosition === player.startPosition
      ) {
        pl.startPosition = undefined;
      }
    });
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = new MarcoPoloPlayer(
        undefined,
        "",
        undefined,
        undefined,
        undefined
      );
      this.players.push(player);
    }
  }

  public onLocationChange(loc: string): void {
    this.location = loc;
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
      if (pl !== player && +player.points < (pl.points ? +pl.points : 0)) {
        placement++;
      }
    });

    return placement;
  }
}
</script>
