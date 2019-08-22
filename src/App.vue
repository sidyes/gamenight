<template>
  <div id="app">
    <Header />
    <section class="section">
      <div class="container">
        <router-view />
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: { Header, Footer },
  name: "App"
};
</script>