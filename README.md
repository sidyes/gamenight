[![Netlify Status](https://api.netlify.com/api/v1/badges/fa7630db-6505-4eb5-9bde-8cb95c248a43/deploy-status)](https://app.netlify.com/sites/reverent-hopper-111d9f/deploys)

# game-night

## Pre-Conditions

1. Create a Fauna DB account as well as a database called `gamenight` and the following  collections
    - friends
    - marco-polo
    - members
2. Create a key at Faun for `server` for the previously created database `gamenight`
3. If you want to run the project locally set the environment variable (your fauna db key) in your commandline tool:  
   `SET FAUNADB_SERVER_SECRET=XXX`

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
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
