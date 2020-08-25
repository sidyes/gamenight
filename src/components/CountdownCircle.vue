<template>
  <div class="base-timer">
    <svg
      class="base-timer__svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45" />
        <path
          :stroke-dasharray="circleDasharray()"
          class="base-timer__path-remaining"
          :class="remainingPathColor()"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span class="base-timer__label has-text-centered">
      <span
        class="is-size-2 has-text-white has-text-weight-bold is-size-6-mobile"
        >{{ formattedTimeLeft() }} </span
      ><br />
      <span class="is-size-4 has-text-light is-uppercase is-size-7-mobile"
        >{{ label }}
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from "vue-property-decorator";

@Component
export default class CountdownCircle extends Vue {
  @Prop({ default: 0 }) timeLeft!: number;
  @Prop({ default: 0 }) timeStart!: number;
  @Prop({ default: "" }) label!: string;

  FULL_DASH_ARRAY = 283;
  WARNING_THRESHOLD = 10;
  ALERT_THRESHOLD = 5;
  COLOR_CODES = {
    info: {
      color: "green",
    },
    warning: {
      color: "orange",
      threshold: this.WARNING_THRESHOLD,
    },
    alert: {
      color: "red",
      threshold: this.ALERT_THRESHOLD,
    },
  };

  formattedTimeLeft() {
    let formattedTime: any = this.timeLeft;

    if (formattedTime < 10) {
      formattedTime = `0${formattedTime}`;
    }
    return formattedTime;
  }

  // Update the dasharray value as time passes, starting with 283
  circleDasharray() {
    return `${(this.timeFraction() * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
  }

  timeFraction() {
    const rawTimeFraction = this.timeLeft / this.timeStart;
    return rawTimeFraction - (1 / this.timeStart) * (1 - rawTimeFraction);
  }

  remainingPathColor() {
    const { alert, warning, info } = this.COLOR_CODES;
    console.log("ez");

    if (this.timeLeft <= alert.threshold) {
      return alert.color;
    } else if (this.timeLeft <= warning.threshold) {
      return warning.color;
    } else {
      return info.color;
    }
  }
}
</script>
<style lang="scss" scoped>
.base-timer {
  margin: auto;
  position: relative;
  max-width: 200px;
  /* Removes SVG styling that would hide the time label */
  &__circle {
    fill: none;
    stroke: none;
  }
  /* The SVG path that displays the timer's progress */
  &__path-elapsed {
    stroke-width: 7px;
    stroke: gray;
  }

  &__label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin-top: -5px;
  }

  &__path-remaining {
    /* Just as thick as the original ring */
    stroke-width: 7px;
    /* Rounds the line endings to create a seamless circle */
    stroke-linecap: round;
    /* Makes sure the animation starts at the top of the circle */
    transform: rotate(90deg);
    transform-origin: center;
    /* One second aligns with the speed of the countdown timer */
    transition: 1s linear all;
    /* Allows the ring to change color when the color value updates */
    stroke: rgb(241, 70, 104);
  }
  &__svg {
    /* Flips the svg and makes the animation to move left-to-right */
    transform: scaleX(-1);
  }
}
</style>
