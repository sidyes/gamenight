const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);
  console.log("Function `wingspan-create` invoked", data);

  return client
    .query(q.Create(q.Collection("wingspan"), { data }))
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
