<template>
  <div class="columns is-mobile is-centered">
    <div class="column has-text-centered">
      <countdown-circle
        :timeLeft="timeLeftDays"
        :timeStart="timeTotalDays"
        :label="'Tage'"
      >
      </countdown-circle>
    </div>

    <div class="column">
      <countdown-circle
        :timeLeft="timeLeftHours"
        :timeStart="timeTotalHours"
        :label="'Stunden'"
      >
      </countdown-circle>
    </div>
    <div class="column">
      <countdown-circle
        :timeLeft="timeLeftMinutes"
        :timeStart="timeTotalMinutes"
        :label="'Minuten'"
      >
      </countdown-circle>
    </div>
    <div class="column">
      <countdown-circle
        :timeLeft="timeLeftSeconds"
        :timeStart="timeTotalSeconds"
        :label="'Sekunden'"
      >
      </countdown-circle>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class NextGameEvent extends Vue {
  @Prop() nextEvent!: number;
  @Prop() nextEventEntered!: number;

  timeLeftDays: number = 0;
  timeTotalDays: number = 0;

  timeLeftHours: number = 0;
  timeTotalHours: number = 0;

  timeLeftMinutes: number = 0;
  timeTotalMinutes: number = 0;

  timeLeftSeconds: number = 0;
  timeTotalSeconds: number = 0;

  mounted(): void {
    if (this.nextEvent && this.nextEventEntered) {
      this.startTimer();
    }
  }

  startTimer(): void {
    setInterval(() => {
      const now = new Date();
      const timeLeftInSeconds = Math.round(
        (this.nextEvent - now.getTime()) / 1000
      );

      this.timeTotalDays = Math.floor(
        Math.abs(this.nextEvent - this.nextEventEntered) / 1000 / 60 / 60 / 24
      );
      this.timeTotalHours = 24;
      this.timeTotalMinutes = 60;
      this.timeTotalSeconds = 60;

      const oneDayInSec = 86400;
      const oneHourInSec = 60 * 60;
      const oneMinuteInSec = 60;

      this.timeLeftDays =
        timeLeftInSeconds < oneDayInSec
          ? 0
          : Math.floor(timeLeftInSeconds / 60 / 60 / 24);

      this.timeLeftHours =
        timeLeftInSeconds < oneHourInSec
          ? 0
          : Math.floor((timeLeftInSeconds / 60 / 60) % 24);

      this.timeLeftMinutes =
        timeLeftInSeconds < oneMinuteInSec
          ? 0
          : Math.floor((timeLeftInSeconds / 60) % 60);

      this.timeLeftSeconds =
        timeLeftInSeconds < 60 ? 0 : timeLeftInSeconds % 60;
    }, 1000);
  }
}
</script>
