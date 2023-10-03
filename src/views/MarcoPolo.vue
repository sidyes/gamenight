<template>
  <div class="marco-polo">
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
                <th class="min-width-200">Spieler</th>
                <th>Startposition</th>
                <th class="min-width-200">Charakter</th>
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
                        >
                          {{ mem.username }}
                        </option>
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
                        >
                          {{ position }}
                        </option>
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
                        >
                          {{ char }}
                        </option>
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
                      src="@/assets/img/marco-polo/marco_polo.png"
                      alt="Marco Polo"
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
                    class="button is-success is-medium is-fullwidth"
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
          <div class="column is-third">
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

          <div class="column is-third">
            <div class="box">
              <pie-chart
                :series="winDistributionStartPosition.wins"
                :labels="winDistributionStartPosition.labels"
                :title="'Gewinnverteilung - Startposition*'"
              ></pie-chart>
              <p class="info">
                *Da es mehrere Sieger in einem Spiel geben kann, kann diese
                Statistik von der rein persönlichen abweichen.
              </p>
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

          <div class="column is-half">
            <div class="box">
              <custom-table
                :data="myTopCharacterTable"
                :headings="myTopCharacterTableHeadings"
              ></custom-table>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
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
  AverageScores,
  CreateGameRequestModel,
  GameCollection,
  GameName,
} from "@/models";

const axios = require("axios");

import { ADD_TOAST_MESSAGE } from "vuex-toast";

@Component({
  components: {},
})
export default class MarcoPolo extends Vue {
  @Getter("getUserStatus", { namespace: "user" }) isLoggedIn!: boolean;
  @Getter("getPlayers", { namespace: "user" }) members!: Member[];
  @Getter("getUser", { namespace: "user" }) user!: Member;

  @Getter("getSeason", { namespace: "marcoPolo" }) currentSeason!: number;
  @Getter("getTimePlayed", { namespace: "marcoPolo" }) avgTime!: string;

  @Getter("getAllSeasons", { namespace: "marcoPolo" }) allSeasons!: number[];

  @Getter("getSelectedSeason", { namespace: "marcoPolo" })
  selectedSeason!: number;

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

  @Getter("getMyTopCharacterTable", { namespace: "marcoPolo" })
  myTopCharacterTable!: ResultTableEntry[];

  @Getter("getMyTopCharacterTableHeadings", { namespace: "marcoPolo" })
  myTopCharacterTableHeadings!: TableHeading[];

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

  @Getter("getGamesLoaded", { namespace: "marcoPolo" })
  gamesLoaded!: boolean;

  @Getter("getIsLoading", { namespace: "marcoPolo" })
  isLoading!: boolean;

  @Getter("getIsNewScoringType", { namespace: "marcoPolo" })
  isNewScoringType!: boolean;

  @Action("fetchGames", { namespace: "marcoPolo" }) fetchGames: any;
  @Action("setLoading", { namespace: "marcoPolo" }) setLoading: any;
  @Action("setSeason", { namespace: "marcoPolo" }) setSeason: any;
  @Action("toggleScoringType", { namespace: "marcoPolo" })
  toggleScoringType: any;

  players: MarcoPoloPlayer[] | any[] = [];

  location: string = "";
  timePlayed: number = 0;

  newGameActive = false;

  @Watch("isLoggedIn", { immediate: true, deep: true })
  onIsLoggedInChange(newVal: boolean) {
    if (newVal && !this.gamesLoaded) {
      const payload = {
        ...this.user,
        collection: GameCollection.MARCO_POLO,
      };
      this.fetchGames(payload);
    }
  }

  public onRowClicked(row: number): void {
    this.$router.push({
      name: "marco-polo-detail",
      params: { time: this.resultTable[row].id.toString() },
    });
  }

  public toggleNewGameActive(): void {
    if (this.isLoggedIn) {
      this.newGameActive = !this.newGameActive;
    }
  }

  public saveGame(): void {
    const game = new MarcoPoloGame(
      this.players,
      Date.now(),
      this.location,
      this.currentSeason,
      this.timePlayed
    );
    const request = new CreateGameRequestModel(
      game,
      GameCollection.MARCO_POLO,
      GameName.MARCO_POLO
    );

    this.setLoading(true);
    axios
      .post("/.netlify/functions/game-create", request)
      .then((response: any) => {
        this.newGameActive = false;
        this.players = [];
        this.location = "";

        const payload = {
          ...this.user,
          collection: GameCollection.MARCO_POLO,
        };
        this.fetchGames(payload);

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

  public isFormComplete(): boolean {
    if (this.players.length === 0) {
      return false;
    }

    let valid = true;

    this.players.forEach((pl) => {
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

  public handleSelectedSeasonChange(event: any): void {
    this.setSeason(event.target.value);
  }

  public handleStartPositions(player: MarcoPoloPlayer): void {
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

  public onNrOfPlayersChange(nr: number): void {
    this.players = [];
    for (let i = 0; i < nr; i++) {
      const player = {
        user: undefined,
        character: undefined,
        points: undefined,
        placement: undefined,
        startPosition: undefined,
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

  public onPointsChange(event: any): void {
    this.players.forEach((pl) => {
      pl.placement = this.getPlacement(pl);
    });
  }

  private getPlacement(player: any): number | undefined {
    if (!player.points) {
      return undefined;
    }
    let placement = 1;
    this.players.forEach((pl) => {
      if (pl !== player && +player.points < (pl.points ? +pl.points : 0)) {
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

.form-elem {
  width: 200px;
}
</style>
