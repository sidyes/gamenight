const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  console.log("Function `friends-read` invoked");

  const params = event.queryStringParameters;

  const user = {
    username: params.username,
    email: params.email,
  };

  /* construct the fauna query */
  return client
    .query(q.Exists(q.Match(q.Index("my_friends"), user.email)))
    .then((result) => {
      if (result) {
        return client
          .query(
            q.Map(
              q.Paginate(q.Match(q.Index("my_friends"), user.email)),
              q.Lambda("X", q.Get(q.Var("X")))
            )
          )
          .then((response) => {
            callback(null, {
              statusCode: 200,
              body: JSON.stringify({ friends: response.data[0].data.friends }),
            });
          })
          .catch((error) => {
            /* Error! return the error with statusCode 400 */
            callback(null, {
              statusCode: 404,
              body: JSON.stringify(error),
            });
          });
      } else {
        const friends = {
          friends: [],
        };

        callback(null, {
          statusCode: 200,
          body: JSON.stringify(friends),
        });
      }
    })
    .catch((error) => {
      console.log(error);
      /* Error! return the error with statusCode 400 */
      callback(null, {
        statusCode: 404,
        body: JSON.stringify(error),
      });
    });
};
