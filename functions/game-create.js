const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

exports.handler = async function (event, _context) {
  console.log("📨 Received event:", event.body);

  const data = JSON.parse(event.body);
  const game = {
    ...data.game,
    players: data.game.players.map((p) => ({
      ...p,
      user: { ...p.user, elo: p.user.elo[data.gameName] },
    })),
  };
  const collection = data.collection;
  const gameName = data.gameName;

  const resultTable = `${collection}-player-result`;

  // Step 1: Fetch all past games for this game type
  const { data: allGames, error: gameFetchError } = await supabase
    .from(collection)
    .select(
      `
      *,
      players:${resultTable}(*)
    `
    )
    .order("id", { ascending: true });

  if (gameFetchError) {
    console.error("❌ Error fetching past games:", gameFetchError);
    return {
      statusCode: 500,
      body: JSON.stringify(gameFetchError),
    };
  }
  console.log(`✅ Retrieved ${allGames.length} past games for ELO calculation`);

  // Step 2: Call elo calculation function
  let calculatedElos;
  try {
    const response = await axios.post(
      `${process.env.URL}/.netlify/functions/calculate-elo`,
      {
        game,
        allGames,
      }
    );
    calculatedElos = response.data;
  } catch (err) {
    console.error("❌ Error calling calculate-elo function:", err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }

  // Step 3: Fetch all member data
  const { data: allPlayers, error: membersError } = await supabase
    .from("member")
    .select("*");

  if (membersError) {
    console.error("❌ Error fetching members:", membersError);
    return {
      statusCode: 500,
      body: JSON.stringify(membersError),
    };
  }
  console.log(`👥 Retrieved ${allPlayers.length} members`);

  const emails = game.players.map((p) => p.user.email);
  const activePlayers = allPlayers.filter((p) => emails.includes(p.email));
  console.log(
    "🎯 Matched active players by email:",
    activePlayers.map((p) => p.username)
  );

  // Step 4: Update ELO ratings
  for (let player of activePlayers) {
    const updatedElo = calculatedElos.find(
      (e) => e.email === player.email
    )?.elo;
    if (updatedElo !== undefined) {
      console.log(`🔄 Updating ELO for ${player.username}: ${updatedElo}`);
      const { error: updateEloError } = await supabase
        .from("elo")
        .update({ [gameName]: updatedElo })
        .eq("player", player.username);

      if (updateEloError) {
        console.error(
          `❌ Failed to update ELO for ${player.username}:`,
          updateEloError
        );
      } else {
        console.log(`✅ Updated ELO for ${player.username}: ${updatedElo}`);
      }
    }
  }

  // Step 5: Insert new game
  const { data: insertedGame, error: insertGameError } = await supabase
    .from(collection)
    .insert({
      location: game.location,
      season: game.season,
      time: game.time,
      timePlayed: game.timePlayed,
    })
    .select("id")
    .single();

  if (insertGameError) {
    console.error("❌ Error inserting game:", insertGameError);
    return {
      statusCode: 400,
      body: JSON.stringify(insertGameError),
    };
  }
  console.log("✅ Inserted new game with ID:", insertedGame.id);

  // Step 6: Insert player results
  const playerResults = game.players.map((p) => {
    const result = {
      player: p.user.username,
      placement: p.placement,
      points: p.points,
      appealPoints: p.appealPoints,
      conservationPoints: p.conservationPoints,
      startPosition: p.startPosition,
      zooMap: p.zooMap,
      game: insertedGame.id,
      appealPointsCompare: p.appealPointsCompare,
      elo: calculatedElos.find((e) => e.email === p.user.email)?.elo || null,
    };
    console.log(`📝 Prepared result for ${result.player}:`, result);
    return result;
  });

  const { error: insertResultsError } = await supabase
    .from(resultTable)
    .insert(playerResults);

  if (insertResultsError) {
    console.error("❌ Error inserting player results:", insertResultsError);
    return {
      statusCode: 400,
      body: JSON.stringify(insertResultsError),
    };
  }

  console.log(
    `✅ Successfully inserted ${playerResults.length} player results`
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, gameId: insertedGame.id }),
  };
};
