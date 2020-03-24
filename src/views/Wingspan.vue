<template>
  <div class="wingspan">
    <div class="loading-wrapper" v-if="isLoading">
      <progress class="progress is-small is-primary" max="100">15%</progress>
    </div>
    <section class="section">
      <new-game-modal
        :isOpened.sync="newGameActive"
        :title="'Neues Spiel'"
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
                <th v-for="(player, idx) in players" v-bind:key="idx">
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
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Vögel
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.birds"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Bonuskarten
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.bonusCards"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Rundenziele
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.endOfRoundGoals"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Eier
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.eggs"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Gelagertes Futter
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.foodOnCards"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>
                  Karten unter Vögeln
                </td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.tuckedCards"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Punkte</th>
                <th v-for="(player, idx) in players" v-bind:key="idx">
                  <p>{{ calcTotalPoints(player) }}</p>
                </th>
              </tr>
              <tr>
                <th>Platzierung</th>
                <th v-for="(player, idx) in players" v-bind:key="idx">
                  <p>{{ player.placement | placement }}</p>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </new-game-modal>

      <div class="container">
        <banner-notification
          v-if="!isLoggedIn"
          :color="'is-danger'"
          :message="'Bitte logge dich ein um deine Statistiken zu sehen oder ein Spiel zu speichern.'"
        ></banner-notification>

        <div class="columns">
          <div class="column is-full">
            <div class="box">
              <div class="columns is-vcentered">
                <div class="column is-one-fifth">
                  <figure class="image is-128x128 has-image-centered">
                    <img
                      class="is-rounded"
                      src="@/assets/img/wingspan/wingspan.jpg"
                      alt="Flügelschlag"
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
          <div class="column is-half">
            <div class="box">
              <pie-chart
                :series="winDistributionPlayer.wins"
                :labels="winDistributionPlayer.labels"
                :title="'Gewinnverteilung - Spieler*'"
              ></pie-chart>
              <p class="info">
                *Da es mehrere Sieger in einem Spiel geben kann, kann diese
                Statistik von der rein persönlichen abweichen.
              </p>
            </div>
          </div>

          <div class="column is-half">
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
              <stacked-column-chart
                :series="averagePointsDistribution.series"
                :categories="averagePointsDistribution.categories"
                title="Durchnittliche Punkte pro Kategorie"
              />
            </div>
          </div>

          <div class="column is-half">
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
import { Getter, Action } from "vuex-class";
import {
  Member,
  WingspanPlayer,
  WingspanGame,
  GameSummaryItem,
  AllTimeTableEntry,
  TableHeading,
  GameScoreItem,
  WinDistribution,
  AverageScores,
  ResultTableEntry,
  Series,
  StackedColumChartData,
} from "@/models";

const axios = require("axios");
const toast = require("vuex-toast");

@Component
export default class Wingspan extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getUser", { namespace: "user" }) user!: Member;
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];

  @Getter("getGamesLoaded", { namespace: "wingspan" })
  gamesLoaded!: boolean;

  @Getter("getAllTimeTable", { namespace: "wingspan" })
  allTimeTable!: AllTimeTableEntry[];
  @Getter("getAllTimeTableHeadings", { namespace: "wingspan" })
  allTimeHeadings!: TableHeading[];

  @Getter("getSummary", { namespace: "wingspan" })
  gameSummary!: GameSummaryItem[];

  @Getter("getGameScores", { namespace: "wingspan" })
  gameScores!: GameScoreItem[];

  @Getter("getWinDistributionPlayer", { namespace: "wingspan" })
  winDistributionPlayer!: WinDistribution[];

  @Getter("getAverageScores", { namespace: "wingspan" })
  averageScores!: AverageScores;

  @Getter("getAveragePointsDistribution", { namespace: "wingspan" })
  averagePointsDistribution!: StackedColumChartData;
  @Getter("getGamesLastYear", { namespace: "wingspan" })
  gamesOverTime!: Series[];

  @Getter("getResultTable", { namespace: "wingspan" })
  resultTable!: ResultTableEntry[];

  @Getter("getResultTableHeadings", { namespace: "wingspan" })
  resultHeadings!: TableHeading[];

  @Getter("getIsLoading", { namespace: "wingspan" })
  isLoading!: boolean;

  @Action("fetchGames", { namespace: "wingspan" }) fetchGames: any;
  @Action("setLoading", { namespace: "wingspan" }) setLoading: any;

  newGameActive = false;
  players: WingspanPlayer[] | any[] = [];
  location: string = "";

  @Watch("isLoggedIn", { immediate: true, deep: true })
  onIsLoggedInChange(newVal: boolean) {
    if (newVal && !this.gamesLoaded) {
      this.fetchGames(this.user);
    }
  }

  public toggleNewGameActive(): void {
    if (this.isLoggedIn) {
      this.newGameActive = !this.newGameActive;
    }
  }

  public onRowClicked(row: number): void {
    // this.$router.push({
    //   name: "marco-polo-detail",
    //   params: { time: this.resultTable[row].id.toString() }
    // });
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        placement: undefined,
        birds: undefined,
        bonusCards: undefined,
        endOfRoundGoals: undefined,
        eggs: undefined,
        foodOnCards: undefined,
        tuckedCards: undefined,
      };

      this.players.push(player as any);
    }
  }

  public onLocationChange(loc: string): void {
    this.location = loc;
  }

  public isFormComplete(): boolean {
    if (this.players.length === 0) {
      return false;
    }

    let valid = true;

    this.players.forEach((pl) => {
      if (
        !pl.user ||
        !pl.placement ||
        !pl.birds ||
        !pl.bonusCards ||
        !pl.endOfRoundGoals ||
        !pl.eggs ||
        !pl.foodOnCards ||
        !pl.tuckedCards ||
        !this.location
      ) {
        valid = false;
      }
    });

    return valid;
  }

  public calcTotalPoints(player: WingspanPlayer): number {
    let sum = 0;

    sum += +player.birds || 0;
    sum += +player.bonusCards || 0;
    sum += +player.endOfRoundGoals || 0;
    sum += +player.eggs || 0;
    sum += +player.foodOnCards || 0;
    sum += +player.tuckedCards || 0;

    return sum;
  }

  public onPointsChange(event: any): void {
    this.players.forEach((pl) => {
      pl.placement = this.getPlacement(pl);
    });
  }

  public saveGame(): void {
    const game = new WingspanGame(this.players, Date.now(), this.location);
    this.setLoading(true);
    axios
      .post("/.netlify/functions/wingspan-create", game)
      .then((response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";

        this.fetchGames(this.user);

        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Spiel gespeichert! 🥳",
          type: "success",
          dismissAfter: 2000,
        });
      })
      .catch((err: any) => {
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Irgendwas ist schief gelaufen! 😱",
          type: "danger",
          dismissAfter: 1000,
        });
      })
      .finally(() => {
        this.setLoading(false);
      });
  }

  private getPlacement(player: any): number | undefined {
    const points = this.calcTotalPoints(player);

    if (points === 0) {
      return undefined;
    }

    let placement = 1;
    this.players.forEach((pl) => {
      if (
        pl !== player &&
        this.calcTotalPoints(player) <
          (this.calcTotalPoints(pl) ? this.calcTotalPoints(pl) : 0)
      ) {
        placement++;
      }
    });

    return placement;
  }
}
</script>
<style lang="scss" scoped>
.info {
  color: lightgray;
  font-size: 12px;
}
</style>
