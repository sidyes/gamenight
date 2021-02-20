const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (_event, _context) {
  console.log("Function `game-events-read` invoked");

  return client
    .query(
      q.Map(
        q.Paginate(q.Documents(q.Collection("game-events"))),
        q.Lambda((x) => q.Get(x))
      )
    )
    .then((response) => {
      const items = {
        items: response.data.map((entry) => entry.data),
      };

      return {
        statusCode: 200,
        body: JSON.stringify(items),
      };
    })
    .catch((error) => {
      return {
        statusCode: 404,
        body: JSON.stringify(error),
      };
    });
};
