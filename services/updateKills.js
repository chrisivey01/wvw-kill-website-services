const services = require("./services");

module.exports = {
  updateKills(pool) {
    pool.query("SELECT * FROM users").then(results => {
      Promise.all(
        results.map(player => {
          return services.obtainAchievements(player.api).then(killResults => {
            let updatedkillResults = killResults.find(res => res.id === 283);
            console.log("new" + updatedkillResults.current);
            console.log("old" + player.current_kills);

            let weekly_tally = updatedkillResults.current;
            let weekly_kill_total =
              updatedkillResults.current - player.current_kills;
            let api = player.api;

            let killWeeklySQL =
              "UPDATE users SET weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
            var values = [weekly_tally, weekly_kill_total, api];
            pool.query(killWeeklySQL, values);
          });
        })
      );
      Promise.all(
        results.map(player => {
          return services.obtainAccount(player.api).then(account => {
            // player.world = account.world;

            let obj = worldArray.filter(world => account.world === world.id )

            player.world = obj[0].name;

            let updateWorld = 
            "UPDATE users SET world = ? WHERE api = ?;"
            let values = [player.world, player.api];
            pool.query(updateWorld, values)
          });
        })
      );
    });
  }
};
