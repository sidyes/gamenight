<template>
  <div class="profile">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Mein Profil</h1>
          <h2 class="subtitle">Info & Freunde</h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title has-text-white">Information</p>
              <p class="subtitle has-text-light">Wer bin ich? 🙇🏼</p>
              <div class="content">
                <div class="columns">
                  <div class="column">
                    <strong class="has-text-white">Benutzername</strong>
                  </div>
                  <div class="column has-text-light">{{ user.username }}</div>
                </div>
                <div class="columns">
                  <div class="column">
                    <strong class="has-text-white">E-Mail</strong>
                  </div>
                  <div class="column has-text-light">{{ user.email }}</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";

//@ts-ignore
import bulmaCalendar from "bulma-calendar/dist/js/bulma-calendar.min.js";


@Component({
  components: {},
})
export default class Profile extends Vue {
  @Getter("getUser", { namespace: "user" }) user: any;

  $refs!: {
    calendarTrigger: any;
  };

  public mail: string = "";

  public nextEvent: number = 0;
  public calendar: any;

  public mounted(): void {
    const today = new Date();
    this.calendar = bulmaCalendar.attach(this.$refs.calendarTrigger, {
      startDate: today,
      type: "date",
      showFooter: false,
      showButtons: false,
      minDate: today,
      color: "#9F78D1",
    })[0];
    this.calendar.on("select", (e: any) => {
      const valid = new Date(this.calendar.value()).getTime();
      if (valid > 0 && valid > today.getTime()) {
        this.nextEvent = valid;
      }
    });
  }

  public isNextEventInvalid(): boolean {
    return this.nextEvent === 0 || this.calendar.isOpen();
  }

  public isMailInvalid(): boolean {
    return (
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.mail) === false
    );
  }
}
</script>
