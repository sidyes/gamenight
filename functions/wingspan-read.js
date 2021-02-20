const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  console.log("Function `wingspan-read` invoked");

  const params = event.queryStringParameters;

  const user = {
    username: params.username,
    email: params.email,
  };

  /* construct the fauna query */
  return client
    .query(
      q.Map(
        q.Paginate(q.Match(q.Index("my-wingspan"), user.email)),
        q.Lambda("X", q.Get(q.Var("X")))
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
