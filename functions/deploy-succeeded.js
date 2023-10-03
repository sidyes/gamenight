/**
 * This gets automaticalled called when the build has been successfully deployed on Netlify.
 */
const faunadb = require("faunadb"); /* Import faunaDB sdk */
const axios = require("axios");

/* configure faunaDB Client */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

const updateCollection = async (collection, allGames) => {
  const updatedGames = allGames.map((game) => ({
    data: {
      ...game,
    },
  }));

  await client
    .query(
      q.Map(
        updatedGames,
        q.Lambda(
          ["d"],
          q.Replace(
            q.Select(
              "ref",
              q.Get(
                q.Match(
                  q.Index(`get-${collection}`),
                  q.Select(["data", "time"], q.Var("d"))
                )
              )
            ),
            q.Var("d")
          )
        )
      )
    )
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });
};

const calculateElosForGame = (allGames, game, gameName) => {
  // get temp elos
  return axios
    .post(`${process.env.URL}/.netlify/functions/calculate-elo`, {
      game,
      allGames,
      gameName,
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error(error);
    });
};

const updateElosForPlayers = (allPlayers, calculatedElos, gameName) => {
  for (let i = 0; i < allPlayers.length; i++) {
    const player = allPlayers[i];
    player.elo[gameName] = calculatedElos.find(
      (playerWithElo) => playerWithElo.email === player.email
    ).elo;
  }
};

const processGamesInCollection = async (allGames, allPlayers, gameName) => {
  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i];
    console.log(`Start migration for game ${i}/${allGames.length}`);
    const subset = allGames.slice(0, i);

    // update current player elos in game
    updateEloInGame(game, allPlayers, gameName);

    const calculatedElos = await calculateElosForGame(subset, game, gameName);

    // set calculated elos as new elos for all players
    updateElosForPlayers(allPlayers, calculatedElos, gameName);
  }
};

const processCollections = async (collections, allPlayers) => {
  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];

    // collection with camelCase instead of hyphen represents the game name
    var gameName = collection.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });

    const allGames = await getAllGamesForCollection(collection);

    console.log(
      `Starting migration for collection ${collection} with ${allGames.length} games.`
    );

    // update all games and calculate elos
    await processGamesInCollection(allGames, allPlayers, gameName);

    // update collection
    await updateCollection(collection, allGames);

    console.log(`Migration for collection ${collection} finished`);
  }
};

const getAllGamesForCollection = async (collection) => {
  let allGames = await client
    .query(
      q.Map(
        q.Paginate(q.Documents(q.Collection(collection))),
        q.Lambda((x) => q.Get(x))
      )
    )
    .then((response) => response.data.map((entry) => entry.data));

  // sort by time ascending
  allGames.sort((a, b) => +a.time - +b.time);

  return allGames;
};

const updateEloInGame = (game, allPlayers, gameName) => {
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    player.user.elo = allPlayers.find(
      (ref) => ref.email === player.user.email
    )?.elo[gameName];
  }
};

exports.handler = async function (_event, _context) {
  console.log("Start elo migration");

  const collections = [
    "ark-nova",
    "challengers",
    "marco-polo",
    "terra-mystica",
    "wingspan",
  ];

  const defaultElo = 1400;

  // get members and reset their elos for calculation
  const allPlayers = await axios
    .get(`${process.env.URL}/.netlify/functions/members-read`)
    .then((response) =>
      response.data.items.map((member) => ({
        ...member,
        elo: {
          arkNova: defaultElo,
          challengers: defaultElo,
          marcoPolo: defaultElo,
          terraMystica: defaultElo,
          wingspan: defaultElo,
        },
      }))
    )
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });

  // process collection
  await processCollections(collections, allPlayers);

  // update all players remotely
  await axios.post(
    `${process.env.URL}/.netlify/functions/members-update`,
    allPlayers
  );

  console.log("Finished elo migration");

  return {
    statusCode: 200,
  };
};
