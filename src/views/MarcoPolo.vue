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
                <th>Spieler</th>
                <th>Startposition</th>
                <th>Charakter</th>
                <th>Punkte</th>
                <th>Platzierung</th>
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
                          >{{ mem.username }}</option
                        >
                      </select>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="control">
                    <div class="select">
                      <select
                        v-model="player.startPosition"
                        @change="handleStartPositions(player)"
                      >
                        <option
                          v-for="position in players.length"
                          :value="position"
                          v-bind:key="position"
                          >{{ position }}</option
                        >
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
                          >{{ char }}</option
                        >
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
        <banner-notification
          v-if="!isLoggedIn"
          :color="'is-danger'"
          :message="
            'Bitte logge dich ein um deine Statistiken zu sehen oder ein Spiel zu speichern.'
          "
        ></banner-notification>
        <div class="columns">
          <div class="column is-full">
            <div class="box">
              <div class="columns is-vcentered">
                <div class="column is-one-fifth">
                  <figure class="image is-128x128 has-image-centered">
                    <img
                      class="is-rounded"
                      src="@/assets/img/marco_polo.png"
                      alt="Marco Polo"
                    />
                  </figure>
                </div>
                <div class="column is-three-fifths">
                  <game-summary :items="gameSummary"></game-summary>
                </div>
                <div class="column has-text-right">
                  <a
                    aria-label="Erstelle ein neues Spiel"
                    class="button is-medium is-success"
                    @click="toggleNewGameActive()"
                    :disabled="newGameActive || !isLoggedIn"
                    >Neues Spiel</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="columns equal-heights">
          <div class="column is-half">
            <div class="box">
              <custom-table
                :data="allTimeTable"
                :headings="allTimeHeadings"
              ></custom-table>
            </div>
          </div>
          <div class="column is-half">
            <div class="box">
              <game-scores :data="gameScores"></game-scores>
            </div>
          </div>
        </div>

        <div class="columns equal-heights">
          <div class="column is-third">
            <div class="box">
              <win-distribution-player
                :wins="winDistributionPlayer.wins"
                :players="winDistributionPlayer.labels"
              ></win-distribution-player>
            </div>
          </div>

          <div class="column is-third">
            <div class="box">
              <win-distribution-start-position
                :wins="winDistributionStartPosition.wins"
                :positions="winDistributionStartPosition.labels"
              ></win-distribution-start-position>
            </div>
          </div>

          <div class="column is-third">
            <div class="box">
              <average-scores-widget
                :data="averageScores"
              ></average-scores-widget>
            </div>
          </div>
        </div>

        <div class="columns is-vcentered">
          <div class="column is-half">
            <div class="box">
              <custom-table
                :data="characterTable"
                :headings="characterTableHeadings"
              ></custom-table>
            </div>
          </div>

          <div class="column is-half ">
            <div class="box">
              <games-over-time :series="gamesOverTime"></games-over-time>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="box">
              <custom-table
                @row-clicked="onRowClicked"
                :data="resultTable"
                :headings="resultHeadings"
              ></custom-table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Action, Getter } from "vuex-class";
import { Member } from "@/models/member.model";
import { MarcoPoloPlayer, MarcoPoloGame } from "@/models/marco-polo.model";
import {
  AllTimeTableEntry,
  GameScoreItem,
  GameSummaryItem,
  Series,
  TableHeading,
  WinDistribution,
  ResultTableEntry,
  AverageScores
} from "@/models";

const axios = require("axios");
const toast = require("vuex-toast");

@Component({
  components: {}
})
export default class MarcoPolo extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];
  @Getter("getUser", { namespace: "user" }) user!: Member;

  @Getter("getSummary", { namespace: "marcoPolo" })
  gameSummary!: GameSummaryItem[];

  @Getter("getResultTable", { namespace: "marcoPolo" })
  resultTable!: ResultTableEntry[];

  @Getter("getResultTableHeadings", { namespace: "marcoPolo" })
  resultHeadings!: TableHeading[];

  @Getter("getCharacterTable", { namespace: "marcoPolo" })
  characterTable!: ResultTableEntry[];

  @Getter("getCharacterTableHeadings", { namespace: "marcoPolo" })
  characterTableHeadings!: TableHeading[];

  @Getter("getAllTimeTable", { namespace: "marcoPolo" })
  allTimeTable!: AllTimeTableEntry[];

  @Getter("getAllTimeTableHeadings", { namespace: "marcoPolo" })
  allTimeHeadings!: TableHeading[];

  @Getter("getCharacters", { namespace: "marcoPolo" })
  characters!: string[];

  @Getter("getGameScores", { namespace: "marcoPolo" })
  gameScores!: GameScoreItem[];

  @Getter("getGamesLastYear", { namespace: "marcoPolo" })
  gamesOverTime!: Series[];

  @Getter("getWinDistributionPlayer", { namespace: "marcoPolo" })
  winDistributionPlayer!: WinDistribution[];

  @Getter("getWinDistributionStartPosition", { namespace: "marcoPolo" })
  winDistributionStartPosition!: WinDistribution[];

  @Getter("getAverageScores", { namespace: "marcoPolo" })
  averageScores!: AverageScores;

  @Action("fetchGames", { namespace: "marcoPolo" }) fetchGames: any;

  players: MarcoPoloPlayer[] | any[] = [];

  location: string = "";

  newGameActive = false;

  @Watch("isLoggedIn", { immediate: true, deep: true })
  onIsLoggedInChange(newVal: boolean) {
    if (newVal) {
      this.fetchGames(this.user);
    }
  }

  public onRowClicked(row: number): void {
    // eslint-disable-next-line no-console
    console.log("clicked row", row);
  }

  public toggleNewGameActive(): void {
    if (this.isLoggedIn) {
      this.newGameActive = !this.newGameActive;
    }
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
          text: "Spiel gespeichert! 🥳",
          type: "success",
          dismissAfter: 2000
        });

        this.fetchGames(this.user);
      })
      .catch((err: any) => {
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Irgendwas ist schief gelaufen! 😱",
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
        pl.startPosition = 0;
      }
    });
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        character: undefined,
        points: undefined,
        placement: undefined,
        startPosition: undefined
      };

      this.players.push(player as any);
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

<style lang="scss" scoped>
@media (min-width: 769px) {
  .columns.equal-heights {
    flex-wrap: wrap;
    align-items: stretch;

    .column {
      display: flex;
      position: relative;

      .box {
        width: 100%;
      }
    }
  }
}
</style>
