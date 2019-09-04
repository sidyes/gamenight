import faunadb from "faunadb"; /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context) => {
  console.log("Function `members-read` invoked");

  /* construct the fauna query */
  return client
    .query(q.Paginate(q.Match(q.Index("all_members"))))
    .then(response => {
      const refs = response.data;
      const getAllMembers = refs.map(r => q.Get(r));

      return client.query(getAllMembers).then(ret => {
        const members = ret.map(el => ({
          username: el.data.username,
          email: el.data.email
        }));

        /* Success! return the response with statusCode 200 */
        return {
          statusCode: 200,
          body: JSON.stringify(members)
        };
      });
    })
    .catch(error => {
      console.log("error", error);
      /* Error! return the error with statusCode 400 */
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      };
    });
};
