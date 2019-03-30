const services = require("./services");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  async updateKills(pool) {
    try {
      let queryResults = await pool.query(
        "SELECT * FROM users WHERE weekly_kill_total IS NOT NULL;"
      );
      let killIterator = 0;
      for (results of queryResults) {
        try{
        let gw2Results = await services.obtainAchievements(results.api);
        delay(2000);
        let updatedkillResults = gw2Results.data.find(res => res.id === 283)
        console.log('Kill clear ' + killIterator++)

        let current_kills = updatedkillResults.current;
        let weekly_tally = updatedkillResults.current;
        let weekly_kill_total = 0;
        let api = results.api;

        let killWeeklySQL =
          "UPDATE users SET current_kills = ?, weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
        let values = [current_kills, weekly_tally, weekly_kill_total, api];
        await pool.query(killWeeklySQL, values);
        }catch(e){
          console.log(e.response)
        }
      }
    } catch (e) {
      console.log(e.response);
    }
  }
};

// .then(results => {
//     Promise.all(results.map(player => {
//         return services.obtainAchievements(player.api)
//             .then(killResults => {
//                 if(killResults.text !== "invalid key"){
//                 delay(1000)
//                 let updatedkillResults = killResults.find(res => res.id === 283)

//                 let current_kills = updatedkillResults.current
//                 let weekly_tally = updatedkillResults.current
//                 let weekly_kill_total = 0
//                 let api = player.api

//                 let killWeeklySQL = "UPDATE users SET current_kills = ?, weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
//                 var values = [
//                     current_kills,
//                     weekly_tally,
//                     weekly_kill_total,
//                     api
//                 ];
//                 pool.query(killWeeklySQL, values);
//                 }
//             })
//     }))
// })
