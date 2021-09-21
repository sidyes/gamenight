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
        :players="members"
        @players-changed="onNrOfPlayersChange"
        @closed="newGameActive = false"
        @game-saved="saveGame"
        @location-changed="onLocationChange"
      >
        <div class="columns">
          <div class="column is-one-third-desktop is-one-third-tablet">
            <div class="field">
              <label class="label">Karte</label>
              <div class="control">
                <div class="select">
                  <select v-model="map">
                    <option
                      v-for="avlMap in maps"
                      :value="avlMap"
                      v-bind:key="avlMap"
                    >
                      {{ avlMap }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <td>Volk</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <div class="control">
                    <div class="select">
                      <select v-model="player.faction">
                        <option
                          v-for="faction in factions"
                          :value="faction"
                          v-bind:key="faction"
                        >
                          {{ faction }}
                        </option>
                      </select>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Punkte</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="18"
                    v-model="player.gamePoints"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>Gebietswertung</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.area"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>Kultwertung</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.cult"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>Ressourcen</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.resources"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Gesamtpunktzahl</th>
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
                      src="@/assets/img/terra-mystica/terra-mystica.jpg"
                      alt="Terra Mystica"
                    />
                  </figure>
                </div>
                <div class="column is-three-fifths">
                  <game-summary :items="gameSummary"></game-summary>
                </div>
                <div class="column has-text-right">
                  <div class="select form-elem mb-10 is-info">
                    <select @change="handleSelectedSeasonChange($event)">
                      <option :value="-1">Gesamtstatistik</option>
                      <option
                        v-for="s in allSeasons"
                        :value="s"
                        v-bind:key="s"
                        :selected="s === selectedSeason"
                      >
                        Season {{ s }}
                      </option>
                    </select>
                  </div>
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
              <custom-table
                :data="factionsTable"
                :headings="factionsTableHeadings"
              ></custom-table>
            </div>
          </div>

          <div class="column is-half">
            <div class="box">
              <custom-table
                :data="myTopFactionsTable"
                :headings="myTopFactionsTableHeadings"
              ></custom-table>
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
  AllTimeTableEntry,
  TableHeading,
  ResultTableEntry,
  TerraMysticaPlayer,
  TerraMysticaGame,
  GameScoreItem,
  GameSummaryItem,
  WinDistribution,
  AverageScores,
  Series,
  StackedColumChartData,
} from "@/models";
import { ADD_TOAST_MESSAGE } from "vuex-toast";

const axios = require("axios");

@Component
export default class TerraMystica extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getUser", { namespace: "user" }) user!: Member;
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];

  @Getter("getMaps", { namespace: "terraMystica" })
  maps!: string[];

  @Getter("getFactions", { namespace: "terraMystica" })
  factions!: string[];

  @Getter("getGamesLoaded", { namespace: "terraMystica" })
  gamesLoaded!: boolean;

  @Getter("getSummary", { namespace: "terraMystica" })
  gameSummary!: GameSummaryItem[];

  @Getter("getGameScores", { namespace: "terraMystica" })
  gameScores!: GameScoreItem[];

  @Getter("getWinDistributionPlayer", { namespace: "terraMystica" })
  winDistributionPlayer!: WinDistribution[];

  @Getter("getAverageScores", { namespace: "terraMystica" })
  averageScores!: AverageScores;

  @Getter("getFactionsTable", { namespace: "terraMystica" })
  factionsTable!: ResultTableEntry[];

  @Getter("getFactionsTableHeadings", { namespace: "terraMystica" })
  factionsTableHeadings!: TableHeading[];

  @Getter("getMyTopFactionsTable", { namespace: "terraMystica" })
  myTopFactionsTable!: ResultTableEntry[];

  @Getter("getMyTopFactionsTableHeadings", { namespace: "terraMystica" })
  myTopFactionsTableHeadings!: TableHeading[];

  @Getter("getAveragePointsDistribution", { namespace: "terraMystica" })
  averagePointsDistribution!: StackedColumChartData;

  @Getter("getGamesLastYear", { namespace: "terraMystica" })
  gamesOverTime!: Series[];

  @Getter("getAllTimeTable", { namespace: "terraMystica" })
  allTimeTable!: AllTimeTableEntry[];

  @Getter("getAllTimeTableHeadings", { namespace: "terraMystica" })
  allTimeHeadings!: TableHeading[];

  @Getter("getResultTable", { namespace: "terraMystica" })
  resultTable!: ResultTableEntry[];

  @Getter("getResultTableHeadings", { namespace: "terraMystica" })
  resultHeadings!: TableHeading[];

  @Getter("getIsLoading", { namespace: "terraMystica" })
  isLoading!: boolean;

  @Action("fetchGames", { namespace: "terraMystica" }) fetchGames: any;
  @Action("setLoading", { namespace: "terraMystica" }) setLoading: any;
  @Action("setSeason", { namespace: "terraMystica" }) setSeason: any;

  @Getter("getSeason", { namespace: "terraMystica" }) currentSeason!: number;
  @Getter("getSelectedSeason", { namespace: "terraMystica" })
  selectedSeason!: number;
  @Getter("getAllSeasons", { namespace: "terraMystica" }) allSeasons!: number[];

  newGameActive = false;
  players: TerraMysticaPlayer[] | any[] = [];
  location: string = "";
  map: string = "";

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
      name: "terra-mystica-detail",
      params: { time: this.resultTable[row].id.toString() },
    });
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        placement: undefined,
        faction: undefined,
        points: undefined,
        area: undefined,
        cult: undefined,
        resources: undefined,
      };

      this.players.push(player as any);
    }
  }

  public onLocationChange(loc: string): void {
    this.location = loc;
  }

  public handleSelectedSeasonChange(event: any): void {
    this.setSeason(event.target.value);
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
        !pl.faction ||
        !pl.gamePoints ||
        !pl.area ||
        !pl.cult ||
        !pl.resources ||
        !this.location
      ) {
        valid = false;
      }
    });

    return valid;
  }

  public calcTotalPoints(player: TerraMysticaPlayer): number {
    let sum = 0;

    sum += +player.gamePoints || 0;
    sum += +player.area || 0;
    sum += +player.cult || 0;
    sum += +player.resources || 0;

    player.points = sum;

    return sum;
  }

  public onPointsChange(event: any): void {
    this.players.forEach((pl) => {
      pl.placement = this.getPlacement(pl);
    });
  }

  public saveGame(): void {
    const game = new TerraMysticaGame(
      this.players,
      Date.now(),
      this.location,
      this.map,
      this.currentSeason
    );
    this.setLoading(true);
    axios
      .post("/.netlify/functions/terra-mystica-create", game)
      .then((response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";
        this.map = "";

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

select,
input {
  color: #363636;
}

.select,
select {
  width: 100%;
}
</style>
