const fetch = require('node-fetch');

const accountUrl = 'https://api.guildwars2.com/v2/account?access_token='
const achievementUrl = 'https://api.guildwars2.com/v2/account/achievements?access_token='
const guildUrl = 'https://api.guildwars2.com/v2/guild/'


module.exports = {
    obtainAccount(api){
        return fetch(accountUrl + api)
            .then(results => results.json())
    },

    obtainAchievements(api){
        return fetch(achievementUrl + api)
            .then(results => results.json())
    },

    guildObtainer(guildId){
        return fetch(guildUrl + guildId)
            .then(results => results.json())
    }
}