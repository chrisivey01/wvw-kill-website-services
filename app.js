// grab the packages we need
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

  next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//personal imports
const services = require("./services/services");
const world = require("./services/worldList");
const updateKills = require("./services/updateKills");
const updateKillsFriday = require("./services/updateKillsFriday");
const removeBadApis = require("./services/removeBadApis");

const pool = require("./services/database");

//cron job to update kills
var CronJob = require("cron").CronJob;
new CronJob(
      "0 */1 * * * *",

//   "0 */5 * * * *",
  function() {
    // new CronJob('0/15 * * * * *', function() {
    updateKills.updateKills(pool);
    console.log("You will see this message every 5 minutes");
  },
  null,
  true,
  "America/Chicago"
);

// new CronJob(
//   "0 */1 * * * *",
//   function() {
new CronJob(
  "0 */8 * * * *",
  function() {
    removeApis(pool);
    console.log("You will see this message every 8 minutes");
  },
  null,
  true,
  "America/Chicago"
);

async function removeApis() {
  let queryAllUsersSql = "SELECT * from users ";
  let results = await pool.query(queryAllUsersSql);
  let apiRemover = [];
  await results.forEach(async person => {
    let accountChecker = await services.obtainAccount(person.api);
    if (accountChecker.text === "invalid key") {
      apiRemover.push(person.api);
    }
  });
  if (apiRemover > 0) {
    let removeSql = "DELETE FROM users WHERE api IN (?)";
    await pool.query(removeSql, [apiRemover]);
    console.log(apiRemover.length + "Removed.");
  }
}
// new CronJob('0 */1 * * * *', function() {
new CronJob(
  "0 0 20 * * FRI",
  function() {
    updateKillsFriday.updateKills(pool);
    console.log("You will see this message every friday 8pm");
  },
  null,
  true,
  "America/Chicago"
);

// start the server
app.listen(port);

console.log("Server started! At http://localhost:" + port);

app.post("/api", (req, res) => {
  const api = req.body.api;

  let buildCharacterObj = {};
  let errorMsg = {};
  let guildArray = [];

  const obtainAccounts = services
    .obtainAccount(api)
    .then(results => {
      console.log(results);
      if (results.text) {
        errorMsg.text = results.text;
      }
      buildCharacterObj.api = api;
      buildCharacterObj.name = results.name;
      let obj = worldArray.filter(world => results.world === world.id);
      buildCharacterObj.world = obj[0].name;
      buildCharacterObj.guilds = results.guilds;
    })
    .catch(err => {
      console.log(err);
    });

  const obtainAchievements = services
    .obtainAchievements(api)
    .then(results => {
      if (results.text) {
        errorMsg.text = results.text;
      }
      buildCharacterObj.killInfo = results.find(res => res.id === 283);
      return buildCharacterObj;
    })
    .catch(err => {
      console.log(err);
    });

  Promise.all([obtainAccounts, obtainAchievements]).then(response => {
    console.log(response);
    if (Object.entries(errorMsg).length === 0) {
      Promise.all(
        buildCharacterObj.guilds.map(guild => {
          return services.guildObtainer(guild).then(results => {
            guildArray.push(`${results.name} ${results.tag}`);
          });
        })
      )
        .then(() => {
          buildCharacterObj.guildNames = guildArray;
          res.send(buildCharacterObj);
        })
        .catch(err => {
          res.send(err);
        });
    } else {
      res.send(errorMsg);
    }
  });
});

app.post("/submit", (req, res) => {
  const data = req.body.accountData;
  console.log(data);
  const guildSelector = req.body.guildSelector;

  let myData = {
    api: data.api,
    name: data.name,
    world: data.world,
    current_kills: data.killInfo.current,
    guild: guildSelector
  };
  let wvwSql = `INSERT INTO users SET ? ON DUPLICATE KEY UPDATE guild = VALUES(guild), world = VALUES(world)`;

  pool.query(wvwSql, myData);

  res.send("Account Submitted!");
});

app.get("/topWeekly", function(req, res, next) {
  pool.query(
    "SELECT * from users WHERE weekly_kill_total IS NOT NULL ORDER BY weekly_kill_total  DESC LIMIT 1",
    function(err, results) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/leaderboard", async function(req, res, next) {
  pool.query(
    "SELECT * from users WHERE weekly_tally IS NOT NULL ORDER BY weekly_tally ASC",
    function(err, results) {
      if (err) throw err;
      res.send(results);
    }
  );
});

app.get("/weekly", async function(req, res, next) {
  pool.query(
    "SELECT * from users WHERE weekly_kill_total IS NOT NULL ORDER BY weekly_kill_total ASC",
    function(err, results) {
      if (err) throw err;
      res.send(results);
    }
  );
});
//     buildCharacterObj.guilds.forEach(guild => {
//         services.guildObtainer(guild)
//             .then(results => {
//                 guildArray.push(`${results.name} ${results.tag}`)
//             })
//     })
//     return guildArray
// })
// .then(guildArray =>{
//     buildCharacterObj.guildArray = guildArray
//     return buildCharacterObj
// })
// .then(results=>{
//     res.send(results)
//
// })

// const guildObtainer = (buildCharacterObj.guilds.forEach(guild => {
//     services.guildObtainer(guild)
//         .then(results => {
//             guildArray.concat(`${results.name} ${results.tag}`)
//         })
// }))

// .then((buildCharacterObj) => {

// .then((buildCharacterObj) => {
//     // buildCharacterObj.guilds.map(guild => {
//     const promises = (buildCharacterObj.guilds.forEach(guild => {
//         services.guildObtainer(guild)
//             .then(results => {
//                 guildArray.concat(`${results.name} ${results.tag}`)
//             })
//     }))
//     Promise.all(promises)
//         .then(results => {
//             console.log(results)
//         })
// })
// .then((buildCharacterObj) => {
//     console.log(guildArray)
//     res.send(buildCharacterObj)
// })
// })

//
// .then(results => {
//     res.send(results)
// })

// .then(buildCharacterObj => {
//     buildCharacterObj.guilds.forEach(guild => {
//         services.guildObtainer(guild)
//             .then(results => {
//                 guildArray.push(`${results.name} ${results.tag}`)
//                 buildCharacterObj.guildArray = guildArray
//             })
//     })
//
// })
