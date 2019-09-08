import faunadb from "faunadb"; /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
});

/* export our lambda function as named "handler" export */
exports.handler = (event, context) => {
    /* parse the string body into a useable JS object */
    const data = JSON.parse(event.body);
    console.log("Function `friends-add` invoked", data);

    return client
        .query(q.Exists(q.Match(q.Index("members_email"), data.friend)))
        .then(result => {
            if (result) {
                // friend account exists
                return client.query(q.Map(q.Paginate(q.Match(q.Index("members_email"), data.friend)), q.Lambda("X", q.Get(q.Var("X")))))
                    .then(response => {
                        const friend = response.data[0].data;
                        return client
                            .query(q.Exists(q.Match(q.Index("my_friends"), data.user.email)))
                            .then(result => {
                                // got already a friend list
                                if (result) {
                                    return client
                                        .query(q.Map(q.Paginate(q.Match(q.Index("my_friends"), data.user.email)), q.Lambda("X", q.Get(q.Var("X"))))).then(response => {

                                            const friends = response.data[0].data.friends;
                                            friends.push(friend);
                                            console.log(friends)
                                            return client
                                                .query(q.Update(response.data[0].ref, { data: { friends: friends } })).then(response => {
                                                    return {
                                                        statusCode: 200,
                                                        body: JSON.stringify(response)
                                                    };
                                                }).catch(error => {
                                                    console.log("error", error);
                                                    /* Error! return the error with statusCode 400 */
                                                    return {
                                                        statusCode: 400,
                                                        body: JSON.stringify(error)
                                                    };
                                                });
                                        }).catch(error => {
                                            console.log("error", error);
                                            /* Error! return the error with statusCode 400 */
                                            return {
                                                statusCode: 400,
                                                body: JSON.stringify(error)
                                            };
                                        });
                                } else {
                                    return client
                                        .query(q.Create(q.Collection("friends"), { data: { user: data.user, friends: [data.friend] } })).then(response => {

                                            return {
                                                statusCode: 200,
                                                body: JSON.stringify(response)
                                            };
                                        }).catch(error => {
                                            console.log("error", error);
                                            /* Error! return the error with statusCode 400 */
                                            return {
                                                statusCode: 400,
                                                body: JSON.stringify(error)
                                            };
                                        });
                                }

                            }).catch(error => {
                                console.log("error", error);
                                /* Error! return the error with statusCode 400 */
                                return {
                                    statusCode: 400,
                                    body: JSON.stringify(error)
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
            } else {
                const err = {
                    message: "User does not exist. Please provide a valid mail."
                }
                return {
                    statusCode: 404,
                    body: JSON.stringify(err)
                };
            }
        }).catch(error => {
            console.log("error", error);
            /* Error! return the error with statusCode 400 */
            return {
                statusCode: 400,
                body: JSON.stringify(error)
            };
        });
};
