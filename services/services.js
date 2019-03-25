const fetch = require('node-fetch');
const axios = require('axios')
const accountUrl = 'https://api.guildwars2.com/v2/account?access_token='
const achievementUrl = 'https://api.guildwars2.com/v2/account/achievements?access_token='
const guildUrl = 'https://api.guildwars2.com/v2/guild/'


module.exports = {
    async obtainAccount(api){
        return await axios(accountUrl + api)
            // .then(results => results.json())
    },

    async obtainAchievements(api){
        return await axios(achievementUrl + api)
            // .then(results => results.json())
    },

    async guildObtainer(guildId){
        return await fetch(guildUrl + guildId)
            // .then(results => results.json())
    }
}