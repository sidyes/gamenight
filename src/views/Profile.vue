<template>
  <div class="profile">
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">My Profile</h1>
          <h2 class="subtitle">Info & friends</h2>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title">Information</p>
              <p class="subtitle">Who am I? 🙇🏼</p>
              <div class="content">
                <div class="columns">
                  <div class="column">
                    <strong>Username</strong>
                  </div>
                  <div class="column">{{user.username}}</div>
                </div>
                <div class="columns">
                  <div class="column">
                    <strong>E-Mail</strong>
                  </div>
                  <div class="column">{{user.email}}</div>
                </div>
              </div>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title">Friendfinder</p>
              <p class="subtitle">I want a friend! 🔎</p>
              <div class="content">
                <div class="columns is-vcentered">
                  <div class="column">
                    <div class="field has-addons has-addons-centered">
                      <p class="control has-icons-left">
                        <input
                          class="input"
                          type="email"
                          placeholder="Friend's E-Mail"
                          v-model="mail"
                        />
                        <span class="icon is-left">
                          <font-awesome-icon :icon="['fas', 'envelope']" />
                        </span>
                      </p>
                      <div class="control">
                        <a class="button is-info" :disabled="isMailInvalid()" @click="addFriend">Add</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div class="tile is-parent">
            <article class="tile is-child box">
              <p class="title">Friendlist</p>
              <p class="subtitle">All my buddies in one place! 👬</p>
              <div class="content">
                <div class="field is-grouped is-grouped-multiline is-grouped-centered">
                  <div class="control" v-for="friend in friends" v-bind:key="friend.email">
                    <div class="tags has-addons are-normal">
                      <span class="tag is-dark">{{friend.username}}</span>
                      <a class="tag is-delete"></a>
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
import { Getter } from "vuex-class";
import { Member } from "@/models";
const axios = require("axios");

@Component({
  components: {}
})
export default class Profile extends Vue {
  @Getter("getUser", { namespace: "user" }) user: any;
  @Getter("getFriends", { namespace: "user" }) friends!: Member[];

  public mail: string = "";

  public isMailInvalid(): boolean {
    return (
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.mail) === false
    );
  }

  public addFriend(): void {
    axios
      .post("/.netlify/functions/friends-add", {
        user: {
          username: this.user.username,
          email: this.user.email
        },
        friend: this.mail
      })
      .then((response: any) => {
        if (response.status === 200) {
          this.mail = "";
          // TODO: friend added call
        } else {
          // TODO: show error
        }
      });
  }
}
</script>
