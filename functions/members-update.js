const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

function multiUpsert(arrData) {
  return q.Map(
    arrData,
    q.Lambda(
      ["d"],
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index("members_email"),
              q.Select(["data", "email"], q.Var("d"))
            )
          )
        ),
        q.Var("d")
      )
    )
  );
}

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);
  console.log("Function `members-update` invoked", data);

  const modifiedArray = data.map((elem) => ({ data: { ...elem } }));

  return client
    .query(multiUpsert(modifiedArray))
    .then((response) => {
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    })
    .catch((error) => {
      console.log(error);
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};
