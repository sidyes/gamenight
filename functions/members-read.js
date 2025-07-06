const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

exports.handler = async function (_event, _context) {
  console.log("Function `members-read` invoked");


  let { data, error } = await supabase.from("member").select(`*, elo:elo(*)`);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
