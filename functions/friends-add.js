const faundb = require("faunadb"); /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {
  /* parse the string body into a useable JS object */
  const data = JSON.parse(event.body);
  console.log("Function `friends-add` invoked", data);

  if (data.friend === data.user.email) {
    const message = "You cannot add yourself as a friend!";

    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message }),
    });
  }

  return client
    .query(q.Exists(q.Match(q.Index("members_email"), data.friend)))
    .then((result) => {
      if (result) {
        // friend account exists
        return client
          .query(
            q.Map(
              q.Paginate(q.Match(q.Index("members_email"), data.friend)),
              q.Lambda("X", q.Get(q.Var("X")))
            )
          )
          .then((response) => {
            const friend = response.data[0].data;
            return client
              .query(q.Exists(q.Match(q.Index("my_friends"), data.user.email)))
              .then((result) => {
                // got already a friend list
                if (result) {
                  return client
                    .query(
                      q.Map(
                        q.Paginate(
                          q.Match(q.Index("my_friends"), data.user.email)
                        ),
                        q.Lambda("X", q.Get(q.Var("X")))
                      )
                    )
                    .then((response) => {
                      const friends = response.data[0].data.friends;
                      friends.forEach((fr) => {
                        if (fr.email === friend.email) {
                          const message = `${friend.username} is already your friend!`;

                          callback(null, {
                            statusCode: 400,
                            body: JSON.stringify({ message }),
                          });
                        }
                      });
                      friends.push(friend);

                      return client
                        .query(
                          q.Update(response.data[0].ref, {
                            data: { friends: friends },
                          })
                        )
                        .then(() => {
                          callback(null, {
                            statusCode: 200,
                            body: JSON.stringify({ friend }),
                          });
                        })
                        .catch((error) => {
                          console.log("error", error);
                          /* Error! return the error with statusCode 400 */
                          callback(null, {
                            statusCode: 400,
                            body: JSON.stringify(error),
                          });
                        });
                    })
                    .catch((error) => {
                      console.log("error", error);
                      /* Error! return the error with statusCode 400 */
                      callback(null, {
                        statusCode: 400,
                        body: JSON.stringify(error),
                      });
                    });
                } else {
                  return client
                    .query(
                      q.Create(q.Collection("friends"), {
                        data: { user: data.user, friends: [data.friend] },
                      })
                    )
                    .then(() => {
                      callback(null, {
                        statusCode: 200,
                        body: JSON.stringify({ friend }),
                      });
                    })
                    .catch((error) => {
                      console.log("error", error);
                      /* Error! return the error with statusCode 400 */
                      callback(null, {
                        statusCode: 400,
                        body: JSON.stringify(error),
                      });
                    });
                }
              })
              .catch((error) => {
                console.log("error", error);
                /* Error! return the error with statusCode 400 */
                callback(null, {
                  statusCode: 400,
                  body: JSON.stringify(error),
                });
              });
          })
          .catch((error) => {
            console.log("error", error);
            /* Error! return the error with statusCode 400 */
            callback(null, {
              statusCode: 400,
              body: JSON.stringify(error),
            });
          });
      } else {
        const err = {
          message: "User does not exist. Please provide a valid mail.",
        };

        callback(null, {
          statusCode: 404,
          body: JSON.stringify(err),
        });
      }
    })
    .catch((error) => {
      console.log("error", error);
      /* Error! return the error with statusCode 400 */
      callback(null, {
        statusCode: 400,
        body: JSON.stringify(error),
      });
    });
};
