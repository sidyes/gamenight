<template>
  <div class="arkNova">
    <div class="loading-wrapper" v-if="isLoading">
      <progress class="progress is-small is-primary" max="100">15%</progress>
    </div>
    <section class="section">
      <new-game-modal
        :isOpened.sync="newGameActive"
        :title="'Neues Spiel'"
        :disableSaveBtn="!isFormComplete()"
        :location="location"
        :players="members"
        @players-changed="onNrOfPlayersChange"
        @closed="newGameActive = false"
        @game-saved="saveGame"
        @location-changed="onLocationChange"
        @time-changed="onTimeChange"
      >
        <div class="table-container">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Spieler</th>
                <th
                  v-for="(player, idx) in players"
                  v-bind:key="idx"
                  class="min-width-200"
                >
                  <div class="control">
                    <div class="select">
                      <select v-model="player.user">
                        <option
                          v-for="mem in members"
                          :value="mem"
                          v-bind:key="mem.email"
                        >
                          {{ mem.username }}
                        </option>
                      </select>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zookarte</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <div class="control">
                    <div class="select">
                      <select v-model="player.zooMap">
                        <option
                          v-for="zooMap in zooMaps"
                          :value="zooMap"
                          v-bind:key="zooMap"
                        >
                          {{ zooMap }}
                        </option>
                      </select>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Startposition</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
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
                        >
                          {{ position }}
                        </option>
                      </select>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Zoo vollständig gebaut</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <div class="field has-text-centered">
                    <input
                      type="checkbox"
                      name="zooFullToggle"
                      class="switch is-small"
                      v-bind:id="'zooFullToggle-' + idx"
                      v-model="player.zooMapFull"
                    />
                    <label v-bind:for="'zooFullToggle-' + idx"></label>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Artenschutzpunkte</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.conservationPoints"
                  />
                </td>
              </tr>
              <tr>
                <td>Attraktionspunkte</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.appealPoints"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>Attraktionspunkte - Zielwert</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.appealPointsCompare"
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
                  <p>{{ player.placement }}</p>
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
              <div class="columns is-vcentered is-multiline">
                <div class="column is-one-fifth">
                  <figure class="image is-128x128 has-image-centered">
                    <img
                      class="is-rounded is-128x128"
                      src="@/assets/img/ark-nova/arche-nova.webp"
                      alt="Arche Nova"
                    />
                  </figure>
                </div>
                <div class="column is-three-fifths">
                  <game-summary :items="gameSummary"></game-summary>
                </div>
                <div class="column has-text-right">
                  <a
                    aria-label="Erstelle ein neues Spiel"
                    class="button is-medium is-success is-fullwidth"
                    @click="toggleNewGameActive()"
                    :disabled="newGameActive || !isLoggedIn"
                    >Neues Spiel</a
                  >
                </div>
                <div class="column is-full has-text-centered has-text-white">
                  Durchschnittliche Spielzeit: {{ avgTime }}
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
              <div class="field has-text-centered mt-4">
                <input
                  id="newScoringTypeActive"
                  type="checkbox"
                  name="newScoringTypeActive"
                  class="switch is-outlined is-info"
                  @click="toggleScoringType()"
                  v-model="isNewScoringType"
                />
                <label for="newScoringTypeActive" class="has-text-white"
                  >Neues Punktesystem</label
                >
              </div>
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
              <custom-table
                :data="zooTable"
                :headings="zooTableHeadings"
              ></custom-table>
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
  ArkNovaPlayer,
  ArkNovaGame,
  GameSummaryItem,
  AllTimeTableEntry,
  TableHeading,
  GameScoreItem,
  WinDistribution,
  AverageScores,
  ResultTableEntry,
  Series,
} from "@/models";
import { ADD_TOAST_MESSAGE } from "vuex-toast";

const axios = require("axios");

@Component
export default class Arknova extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getUser", { namespace: "user" }) user!: Member;
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];

  @Getter("getZooMaps", { namespace: "arkNova" })
  zooMaps!: string[];

  @Getter("getGamesLoaded", { namespace: "arkNova" })
  gamesLoaded!: boolean;

  @Getter("getTimePlayed", { namespace: "arkNova" }) avgTime!: string;
  @Getter("getSeason", { namespace: "arkNova" }) currentSeason!: number;

  @Getter("getAllTimeTable", { namespace: "arkNova" })
  allTimeTable!: AllTimeTableEntry[];
  @Getter("getAllTimeTableHeadings", { namespace: "arkNova" })
  allTimeHeadings!: TableHeading[];

  @Getter("getSummary", { namespace: "arkNova" })
  gameSummary!: GameSummaryItem[];

  @Getter("getGameScores", { namespace: "arkNova" })
  gameScores!: GameScoreItem[];

  @Getter("getWinDistributionPlayer", { namespace: "arkNova" })
  winDistributionPlayer!: WinDistribution[];

  @Getter("getAverageScores", { namespace: "arkNova" })
  averageScores!: AverageScores;

  @Getter("getGamesLastYear", { namespace: "arkNova" })
  gamesOverTime!: Series[];

  @Getter("getResultTable", { namespace: "arkNova" })
  resultTable!: ResultTableEntry[];

  @Getter("getResultTableHeadings", { namespace: "arkNova" })
  resultHeadings!: TableHeading[];

  @Getter("getIsLoading", { namespace: "arkNova" })
  isLoading!: boolean;

  @Getter("getZooTable", { namespace: "arkNova" })
  zooTable!: ResultTableEntry[];

  @Getter("getZooTableHeadings", { namespace: "arkNova" })
  zooTableHeadings!: TableHeading[];

  @Getter("getIsNewScoringType", { namespace: "arkNova" })
  isNewScoringType!: boolean;

  @Action("fetchGames", { namespace: "arkNova" }) fetchGames: any;
  @Action("setLoading", { namespace: "arkNova" }) setLoading: any;
  @Action("toggleScoringType", { namespace: "arkNova" })
  toggleScoringType: any;

  newGameActive = false;
  players: ArkNovaPlayer[] | any[] = [];
  location: string = "";
  timePlayed: number = 0;

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
    this.$router.push({
      name: "ark-nova-detail",
      params: { time: this.resultTable[row].id.toString() }
    });
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        placement: undefined,
        points: undefined,
        appealPoints: undefined,
        appealPointsCompare: undefined,
        conservationPoints: undefined,
        startPosition: undefined,
        zooMapFull: undefined,
        zooMap: undefined,
      };

      this.players.push(player as any);
    }
  }

  public onLocationChange(loc: string): void {
    this.location = loc;
  }

  public onTimeChange(time: number): void {
    this.timePlayed = time;
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
        !pl.appealPoints ||
        !pl.appealPointsCompare ||
        !pl.conservationPoints ||
        !pl.startPosition ||
        !this.location
      ) {
        valid = false;
      }
    });

    return valid;
  }

  public calcTotalPoints(player: ArkNovaPlayer): number {
    let sum = 0;

    sum += +player.appealPoints || 0;
    sum -= +player.appealPointsCompare || 0;

    player.points = sum;

    return sum;
  }

  public onPointsChange(event: any): void {
    this.players.forEach((pl) => {
      pl.placement = this.getPlacement(pl);
    });
  }

  public handleStartPositions(player: ArkNovaPlayer): void {
    this.players.forEach((pl) => {
      if (
        pl !== player &&
        pl.startPosition &&
        pl.startPosition === player.startPosition
      ) {
        pl.startPosition = 0;
      }
    });
  }

  public saveGame(): void {
    const game = new ArkNovaGame(
      this.players,
      Date.now(),
      this.location,
      this.currentSeason,
      this.timePlayed
    );
    this.setLoading(true);
    axios
      .post("/.netlify/functions/ark-nova-create", game)
      .then((_response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";

        this.fetchGames(this.user);

        this.$store.dispatch(ADD_TOAST_MESSAGE, {
          text: "Spiel gespeichert! 🥳",
          type: "success",
          dismissAfter: 2000,
        });
      })
      .catch((err: any) => {
        this.$store.dispatch(ADD_TOAST_MESSAGE, {
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

    let placement = 1;
    this.players.forEach((pl) => {
      const tmpPoints = this.calcTotalPoints(pl);
      if (pl !== player && points < (tmpPoints ? tmpPoints : 0)) {
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

select,
input {
  color: #363636;
}

.select,
select {
  width: 100%;
}
</style>
