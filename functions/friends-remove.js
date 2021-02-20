const faunadb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client  */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

exports.handler = async function (event, _context) {
  const data = JSON.parse(event.body);
  console.log("Function `friends-remove` invoked", data);

  return client
    .query(q.Exists(q.Match(q.Index("my_friends"), data.user.email)))
    .then((result) => {
      // got already a friend list
      if (result) {
        return client
          .query(
            q.Map(
              q.Paginate(q.Match(q.Index("my_friends"), data.user.email)),
              q.Lambda("X", q.Get(q.Var("X")))
            )
          )
          .then((response) => {
            let friend;
            const friends = response.data[0].data.friends;
            const updatedFriends = friends.filter((fr) => {
              if (fr.email !== data.friend) {
                return true;
              } else {
                friend = fr;

                return false;
              }
            });

            return client
              .query(
                q.Update(response.data[0].ref, {
                  data: { friends: updatedFriends },
                })
              )
              .then(() => {
                return {
                  statusCode: 200,
                  body: JSON.stringify({ friend }),
                };
              })
              .catch((error) => {
                console.log("error", error);

                return {
                  statusCode: 400,
                  body: JSON.stringify(error),
                };
              });
          })
          .catch((error) => {
            console.log("error", error);

            return {
              statusCode: 400,
              body: JSON.stringify(error),
            };
          });
      } else {
        const message =
          "Du hast keine Freunde! Wie willst du dann welche löschen?!";

        return {
          statusCode: 400,
          body: JSON.stringify({ message }),
        };
      }
    })
    .catch((error) => {
      console.log("error", error);

      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    });
};
