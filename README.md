[![Netlify Status](https://api.netlify.com/api/v1/badges/fa7630db-6505-4eb5-9bde-8cb95c248a43/deploy-status)](https://app.netlify.com/sites/reverent-hopper-111d9f/deploys)

# game-night

[game-night.rocks](https://game-night.rocks)


## What is game-night

It is web app that allows to track board game results. It is possible to create new events shown on the homescreen, create new seasons for each game, add friends, and see stats for almost anything for the dedicated game.
Currently, the following games are supported:

- Terra Mystica
- Marco Polo
- Wingspan

Since it is only used privately, registrations are not permitted.
Feel free to clone this project and use it for yourself.

## Project setup
```
npm install
npm install -g netlify-cli
netlify link (choose your site on netlify)
SET FAUNADB_SERVER_SECRET=XXX
```


### Compiles and hot-reloads for development
```
netlify dev
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
