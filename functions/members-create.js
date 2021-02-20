const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);
  console.log("Function `members-create` invoked", data);

  return client
    .query(q.Exists(q.Match(q.Index("members_email"), data.email)))
    .then((result) => {
      if (result) {
        console.log("Member already exists", data);

        return { statusCode: 200, body: JSON.stringify(data) };
      } else {
        client
          .query(q.Create(q.Collection("members"), { data }))
          .then((response) => {
            return {
              statusCode: 200,
              body: JSON.stringify(response),
            };
          })
          .catch((error) => {
            return {
              statusCode: 400,
              body: JSON.stringify(error),
            };
          });
      }
    });
};
