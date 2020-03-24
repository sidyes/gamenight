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
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title has-text-white">Freundefinder</p>
              <p class="subtitle has-text-light">Suche nach Freunden! 🔎</p>
              <div class="content">
                <div class="columns is-vcentered">
                  <div class="column">
                    <div class="field has-addons has-addons-centered">
                      <p
                        class="control has-icons-left"
                        :class="{ 'is-loading': addFriendLoading }"
                      >
                        <input
                          class="input"
                          type="email"
                          placeholder="E-Mail"
                          v-model="mail"
                        />
                        <span class="icon is-left">
                          <font-awesome-icon :icon="['fas', 'envelope']" />
                        </span>
                      </p>
                      <div class="control">
                        <a
                          class="button is-info"
                          :disabled="isMailInvalid()"
                          @click="addFriend"
                          aria-label="Füge einen neuen Freund hinzu"
                          >Add</a
                        >
                      </div>
                    </div>
                    <p class="has-text-centered is-danger has-text-danger">
                      {{ addFriendError }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title has-text-white">Freundesliste</p>
              <p class="subtitle has-text-light">
                Hier kannst du deine ganzen Homies sehen! 👬
              </p>
              <div class="content">
                <p
                  v-if="!friends.length"
                  class="has-text-warning has-text-centered is-italic has-text-weight-medium"
                >
                  Noch keine Freunde hinzugefügt.
                </p>
                <div
                  class="field is-grouped is-grouped-multiline is-grouped-centered"
                >
                  <div
                    class="control"
                    v-for="friend in friends"
                    v-bind:key="friend.email"
                  >
                    <div class="tags has-addons are-normal">
                      <span class="tag is-dark">{{ friend.username }}</span>
                      <a
                        class="tag is-delete"
                        @click="removeFriend(friend.email)"
                        aria-label="Entferne einen Freund"
                      ></a>
                    </div>
                  </div>
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
import { Getter, Action } from "vuex-class";
import { Member } from "@/models";

const axios = require("axios");
const toast = require("vuex-toast");

@Component({
  components: {},
})
export default class Profile extends Vue {
  @Getter("getUser", { namespace: "user" }) user: any;
  @Getter("getFriends", { namespace: "user" }) friends!: Member[];

  @Action("addFriend", { namespace: "user" }) addBuddy!: any;
  @Action("removeFriend", { namespace: "user" }) removeBuddy!: any;

  public mail: string = "";
  public addFriendError: string = "";
  public addFriendLoading = false;

  public isMailInvalid(): boolean {
    return (
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(this.mail) === false
    );
  }

  public addFriend(): void {
    if (this.mail === this.user.email) {
      this.addFriendError =
        "Du kannst dich nicht selbst als Freund hinzufügen!";

      return;
    }

    this.addFriendLoading = true;
    const body = {
      user: this.user,
      friend: this.mail,
    };
    axios
      .post("/.netlify/functions/friends-add", body)
      .then((response: any) => {
        this.mail = "";
        this.addFriendError = "";
        this.addBuddy(response.data.friend);

        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Freund hinzugefügt! 🥳",
          type: "success",
          dismissAfter: 2000,
        });
      })
      .catch((err: any) => {
        this.addFriendError = err.response.data.message;
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Irgendwas ist schief gelaufen! 😱",
          type: "danger",
          dismissAfter: 2000,
        });
      })
      .finally(() => (this.addFriendLoading = false));
  }

  public removeFriend(email: string): void {
    axios
      .post("/.netlify/functions/friends-remove", {
        user: this.user,
        friend: email,
      })
      .then((response: any) => {
        this.removeBuddy(response.data.friend);
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Freund entfernt! 🥳",
          type: "success",
          dismissAfter: 2000,
        });
      })
      .catch((err: any) => {
        this.$store.dispatch(toast.ADD_TOAST_MESSAGE, {
          text: "Irgendwas ist schief gelaufen! 😱",
          type: "danger",
          dismissAfter: 2000,
        });
      });
  }
}
</script>
