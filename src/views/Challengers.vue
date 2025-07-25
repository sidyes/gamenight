<template>
  <div class="challengers">
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
                <td>Fans</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.points"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
              <tr>
                <td>Trophäen</td>
                <td v-for="(player, idx) in players" v-bind:key="idx">
                  <input
                    class="input"
                    type="number"
                    min="0"
                    max="200"
                    v-model="player.trophies"
                    @change="onPointsChange($event)"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Punkte</th>
                <th v-for="(player, idx) in players" v-bind:key="idx">
                  <p>{{ player.points }}</p>
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
                      class="is-rounded"
                      src="@/assets/img/challengers/challengers.png"
                      alt="Challengers!"
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
  GameSummaryItem,
  AllTimeTableEntry,
  TableHeading,
  GameScoreItem,
  WinDistribution,
  AverageScores,
  ResultTableEntry,
  Series,
  StackedColumChartData,
  ChallengersPlayer,
  ChallengersGame,
  CreateGameRequestModel,
  GameCollection,
  GameName,
} from "@/models";
import { ADD_TOAST_MESSAGE } from "vuex-toast";

const axios = require("axios");

@Component
export default class Challengers extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getUser", { namespace: "user" }) user!: Member;
  @Getter("getPlayers", { namespace: "user" }) getPlayers!: (
    game: GameName
  ) => Member[];

  @Getter("getGamesLoaded", { namespace: "challengers" })
  gamesLoaded!: boolean;

  @Getter("getSeason", { namespace: "challengers" }) currentSeason!: number;
  @Getter("getTimePlayed", { namespace: "challengers" }) avgTime!: string;

  @Getter("getAllTimeTable", { namespace: "challengers" })
  allTimeTable!: AllTimeTableEntry[];
  @Getter("getAllTimeTableHeadings", { namespace: "challengers" })
  allTimeHeadings!: TableHeading[];

  @Getter("getSummary", { namespace: "challengers" })
  gameSummary!: GameSummaryItem[];

  @Getter("getGameScores", { namespace: "challengers" })
  gameScores!: GameScoreItem[];

  @Getter("getWinDistributionPlayer", { namespace: "challengers" })
  winDistributionPlayer!: WinDistribution[];

  @Getter("getAverageScores", { namespace: "challengers" })
  averageScores!: AverageScores;

  @Getter("getAveragePointsDistribution", { namespace: "challengers" })
  averagePointsDistribution!: StackedColumChartData;

  @Getter("getGamesLastYear", { namespace: "challengers" })
  gamesOverTime!: Series[];

  @Getter("getResultTable", { namespace: "challengers" })
  resultTable!: ResultTableEntry[];

  @Getter("getResultTableHeadings", { namespace: "challengers" })
  resultHeadings!: TableHeading[];

  @Getter("getIsLoading", { namespace: "challengers" })
  isLoading!: boolean;

  @Getter("getIsNewScoringType", { namespace: "challengers" })
  isNewScoringType!: boolean;

  @Action("fetchGames", { namespace: "challengers" }) fetchGames: any;
  @Action("setLoading", { namespace: "challengers" }) setLoading: any;
  @Action("toggleScoringType", { namespace: "challengers" })
  toggleScoringType: any;
  @Action("fetchAllPlayers", { namespace: "user" }) fetchAllPlayers: any;

  newGameActive = false;
  players: ChallengersPlayer[] | any[] = [];
  location: string = "";
  timePlayed: number = 0;
  members: Member[] = [];

  @Watch("isLoggedIn", { immediate: true, deep: true })
  onIsLoggedInChange(newVal: boolean) {
    if (newVal && !this.gamesLoaded) {
      this.fetchGames({ game: GameCollection.CHALLENGERS });
    }
  }

  public toggleNewGameActive(): void {
    if (this.isLoggedIn) {
      this.newGameActive = !this.newGameActive;
      this.members = this.getPlayers(GameName.CHALLENGERS);
    }
  }

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        placement: undefined,
        points: undefined,
        trophies: undefined,
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
        !pl.trophies ||
        !pl.points ||
        !this.location
      ) {
        valid = false;
      }
    });

    return valid;
  }

  public onPointsChange(event: any): void {
    this.players.forEach((pl) => {
      pl.placement = this.getPlacement(pl);
    });
  }

  public saveGame(): void {
    const game = new ChallengersGame(
      this.players,
      Date.now(),
      this.location,
      this.players.length === 4 ? this.currentSeason : -1, // -1 season to count also games not part of a season
      this.timePlayed
    );
    const request = new CreateGameRequestModel(
      game,
      GameCollection.CHALLENGERS,
      GameName.CHALLENGERS
    );

    this.setLoading(true);
    axios
      .post("/.netlify/functions/game-create", request)
      .then((_response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";

        this.fetchGames({ game: GameCollection.CHALLENGERS });
        this.fetchAllPlayers();

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
    if (player.points === 0) {
      return undefined;
    }

    let placement = 1;
    this.players.forEach((pl) => {
      if (pl !== player && player.points < (pl.points ? pl.points : 0)) {
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
