const services = require('./services')
const delay = ms => new Promise(resolve => setTimeout(resolve,ms))

module.exports = {
     updateKills(pool){
        pool.query('SELECT * FROM users WHERE weekly_kill_total IS NOT NULL;')
            .then(results => {
                Promise.all(results.map(player => {
                    return services.obtainAchievements(player.api)
                        .then(killResults => {
                            if(killResults.text !== "invalid key"){
                            delay(1000)
                            let updatedkillResults = killResults.find(res => res.id === 283)

                            let current_kills = updatedkillResults.current
                            let weekly_tally = updatedkillResults.current
                            let weekly_kill_total = 0
                            let api = player.api

                            let killWeeklySQL = "UPDATE users SET current_kills = ?, weekly_tally = ?, weekly_kill_total = ? WHERE api = ?";
                            var values = [
                                current_kills,
                                weekly_tally,
                                weekly_kill_total,
                                api
                            ];
                            pool.query(killWeeklySQL, values);
                            }
                        })
                }))
            })
    }
}


// Promise.all(buildCharacterObj.guilds.map(guild => {
//     return services.guildObtainer(guild)
//         .then(results => {
//             guildArray.push(`${results.name} ${results.tag}`)
//         })
// }))