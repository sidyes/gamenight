const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

exports.handler = async function (event, _context) {
  const params = event.queryStringParameters;
  console.log("Function `game-read` invoked", params.game);

  let { data, error } = await supabase.from(params.game).select(`
    *,
    players:${params.game}-player-result(*, username:player)
`);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
