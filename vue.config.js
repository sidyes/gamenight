module.exports = {
  devServer: {
    proxy: {
      "/.netlify/functions": {
        target: "http://localhost:9000",
        pathRewrite: {
          "^/\\.netlify/functions": ""
        }
      }
    }
  },
  pwa: {
    name: "GameNight",
    themeColor: "#343f57",
    msTileColor: "#000000",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",

    // configure the workbox plugin
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: "dist/service-worker.js"
      // ...other Workbox options...
    }
  }
};
