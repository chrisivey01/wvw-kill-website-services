const services = require("./services");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  async updateKills(pool) {
    let queryResults = await pool.query("SELECT * FROM users");
    let killIterator = 0;
    for (player of queryResults) {
      try {
        let gw2Results = await services.obtainAchievements(player.api);
        delay(2000);
        let updatedkillResults = gw2Results.data.find(res => res.id === 283);
        console.log('Kill iterator ' + killIterator++)
        let weekly_tally = updatedkillResults.current;
        let weekly_kill_total =
          updatedkillResults.current - player.current_kills;
        let api = player.api;

        let killWeeklySQL =
          "UPDATE users SET weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
        let values = [weekly_tally, weekly_kill_total, api];
        await pool.query(killWeeklySQL, values);
      } catch (e) {
        console.log(e.response);
      }
    }
    updateWorlds(pool, queryResults);
  }
};

async function updateWorlds(pool, queryResults) {
  for (player of queryResults) {
    try{
    let gw2Results = await services.obtainAccount(player.api);
    delay(1000);
    let obj = worldArray.filter(world => gw2Results.data.world === world.id);
    player.world = obj[0].name;

    let updateWorld = "UPDATE users SET world = ? WHERE api = ?;";
    let values = [player.world, player.api];
    await pool.query(updateWorld, values);
    }catch(e){
      console.log(e.response)
    }
  }
}

// updateKills(pool) {
//   pool.query("SELECT * FROM users").then((results,err) => {
//       if(err){
//           console.error(err)
//       }
//       let iterator;
//       console.log(iterator++)
//     Promise.all(
//       results.map(player => {
//         return services.obtainAchievements(player.api).then(killResults => {
//           if(killResults.text !== "invalid key"){
//           delay(1000)
//           let updatedkillResults = killResults.find(res => res.id === 283);

//           let weekly_tally = updatedkillResults.current;
//           let weekly_kill_total =
//             updatedkillResults.current - player.current_kills;
//           let api = player.api;

//           let killWeeklySQL =
//             "UPDATE users SET weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
//           var values = [weekly_tally, weekly_kill_total, api];
//           pool.query(killWeeklySQL, values);
//           }
//         });
//       })
//     );
//     Promise.all(
//       results.map(player => {
//         return services.obtainAccount(player.api).then(account => {
//           // player.world = account.world;

//           if(account.text !== "invalid key"){
//           let obj = worldArray.filter(world => account.world === world.id )
//           player.world = obj[0].name;

//           let updateWorld =
//           "UPDATE users SET world = ? WHERE api = ?;"
//           let values = [player.world, player.api];
//           pool.query(updateWorld, values)
//           }
//         });
//       })
//     );
//   });
// }
