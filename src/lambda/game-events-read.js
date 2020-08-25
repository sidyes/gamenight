import faunadb from "faunadb"; /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  console.log("Function `game-events-read` invoked");

  /* construct the fauna query */
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

      callback(null, {
        statusCode: 200,
        body: JSON.stringify(items),
      });
    })
    .catch((error) => {
      /* Error! return the error with statusCode 400 */
      callback(null, {
        statusCode: 404,
        body: JSON.stringify(error),
      });
    });
};
