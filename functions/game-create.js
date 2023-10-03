const faunadb = require("faunadb"); /* Import faunaDB sdk */
const axios = require("axios");

/* configure faunaDB Client */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);
  const game = data.game;
  const collection = data.collection;
  const gameName = data.gameName;
  console.log("Function `create-game` invoked", data);

  // get all games
  let allGames = await client
    .query(
      q.Map(
        q.Paginate(q.Documents(q.Collection(collection))),
        q.Lambda((x) => q.Get(x))
      )
    )
    .then((response) => response.data.map((entry) => entry.data))
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });

  // calculate new elo for incoming game
  const calculatedElos = await axios
    .post(`${process.env.URL}/.netlify/functions/calculate-elo`, {
      game,
      allGames,
      gameName,
    })
    .then((response) => response.data)
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });

  const allPlayers = await axios
    .get(`${process.env.URL}/.netlify/functions/members-read`)
    .then((response) => response.data.items)
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    });

  for (let i = 0; i < allPlayers.length; i++) {
    const player = allPlayers[i];
    player.elo[gameName] = calculatedElos.find(
      (playerWithElo) => playerWithElo.email === player.email
    ).elo;
  }

  // update all players remotely
  await axios.post(
    `${process.env.URL}/.netlify/functions/members-update`,
    allPlayers
  );

  return client
    .query(q.Create(q.Collection(collection), { data: game }))
    .then((response) => {
      console.log("success", response);

      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    })
    .catch((error) => {
      console.log("error", error);

      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};
