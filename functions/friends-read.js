const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client*/
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  console.log("Function `friends-read` invoked");

  const params = event.queryStringParameters;

  const user = {
    username: params.username,
    email: params.email,
  };

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
            return {
              statusCode: 200,
              body: JSON.stringify({ friends: response.data[0].data.friends }),
            };
          })
          .catch((error) => {
            return {
              statusCode: 404,
              body: JSON.stringify(error),
            };
          });
      } else {
        const friends = {
          friends: [],
        };

        return {
          statusCode: 200,
          body: JSON.stringify(friends),
        };
      }
    })
    .catch((error) => {
      console.log(error);
      return {
        statusCode: 404,
        body: JSON.stringify(error),
      };
    });
};
