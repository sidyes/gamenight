import faunadb from 'faunadb' /* Import faunaDB sdk */

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET
})

/* export our lambda function as named "handler" export */
exports.handler = (event, context) => {
    /* parse the string body into a useable JS object */
    const data = JSON.parse(event.body)
    console.log("Function `marco-polo-create` invoked", data)

    /* construct the fauna query */
    return client.query(q.Create(q.Collection('marco-polo'), { data })).then((response) => {
        console.log("success", response)
        /* Success! return the response with statusCode 200 */
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    }).catch((error) => {
        console.log("error", error)
        /* Error! return the error with statusCode 400 */
        return {
            statusCode: 400,
            body: JSON.stringify(error)
        };
    });

}