const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  console.log("Function `game-read` invoked");

  const params = event.queryStringParameters;

  const user = {
    username: params.username,
    email: params.email,
  };

  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index(`my-${params.collection}`), user.email)),
        q.Lambda("X", q.Get(q.Var("X")))
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
