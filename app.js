// grab the packages we need
const express = require("express");
const app = express();
const port = 8000;

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
const emailService = require("./services/emailService");

const pool = require("./services/database");

//cron job to update kills
var CronJob = require("cron").CronJob;

new CronJob(
  // "0 */15 * * * *",

  "0 0 */1 * * *",
  function() {
    updateKills.updateKills(pool);
    console.log("You will see this message every 1 hour");
  },
  null,
  true,
  "America/Chicago"
);

// new CronJob(
//   "0 */1 * * * *",
//   function() {
new CronJob(
  "0 0 */12 * * *",
  function() {
    removeApis(pool);
    console.log("You will see this message every 12 hours");
  },
  null,
  true,
  "America/Chicago"
);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function removeApis() {
  let queryAllUsersSql = "SELECT * from users ";
  let results = await pool.query(queryAllUsersSql);
  let iterator = 0;
  let badIterator = 0;

  for (remove of results) {
    await delay(2000);

    let api = remove.api;
    try {
      let accountChecker = await services.obtainAccount(api);
      console.log("Good account..." + iterator++);
    } catch (e) {
      if (e.response.data.text === "invalid key") {
        let removeSql = "DELETE FROM users WHERE api = ?";
        await pool.query(removeSql, api);
        console.log("Bad account removed..." + badIterator++);
      }
    }
  }
}

// new CronJob('0 */1 * * * *', function() {
new CronJob(
  //update -1 for DST or +1 goes between 20 or 21
  // '30 * * * * *',
  "0 57 20 * * FRI",
  function() {
    updateKillsFriday.updateKills(pool);
    console.log("You will see this message every friday 7:57pm");
  },
  null,
  true,
  "America/Chicago"
);

// start the server
app.listen(port);

console.log("Server started! At http://localhost:" + port);

app.post("/api", async (req, res) => {
  const api = req.body.api;

  let buildCharacterObj = {};
  let errorMsg = {};
  let guildArray = [];

  try {
    const obtainAccounts = await services.obtainAccount(api);
    buildCharacterObj.api = api;
    buildCharacterObj.name = obtainAccounts.data.name;
    let findWorld = worldArray.filter(
      world => obtainAccounts.data.world === world.id
    );
    buildCharacterObj.world = findWorld[0].name;
    buildCharacterObj.guilds = obtainAccounts.data.guilds;
  } catch (e) {
    console.log(e.response.data.text);
    res.send(e.response.data);
  }

  try {
    const obtainAchievements = await services.obtainAchievements(api);

    buildCharacterObj.killInfo = obtainAchievements.data.find(
      res => res.id === 283
    );
    buildCharacterObj;
  } catch (e) {
    console.log(e.response.data.text);
    res.send(e.response.data);
  }

  try {
    await Promise.all(buildCharacterObj.guilds.map(async guild => {
      let obtainGuild = await services.guildObtainer(guild)
        guildArray.push(`${obtainGuild.data.name} ${obtainGuild.data.tag}`);
      }))
    

    buildCharacterObj.guildNames = guildArray;
    res.send(buildCharacterObj);
  } catch (e) {
    res.send('Submit failed! Contact Chris')
  }
});

app.post("/submit", (req, res) => {
  const data = req.body.accountData;
  const guildSelector = req.body.guildSelector;

  let myData = {
    api: data.api,
    name: data.name,
    world: data.world,
    current_kills: data.killInfo.current,
    guild: guildSelector
  };
  console.log(myData);

  let wvwSql =
    "INSERT INTO users SET ? ON DUPLICATE KEY UPDATE guild = VALUES(guild), world = VALUES(world)";

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

app.get("/topWeeklyGuild", async (req, res, next) => {
  let results = await pool.query(
    "SELECT guild, SUM(weekly_kill_total) AS guild_weekly_totals FROM users GROUP BY npmguild"
  );

  res.send(results);
});

app.post('/contactMe', (req, res, next) => {
  console.log(req.body.data)
  emailService.mailServices(req.body.data)
  res.send('Mail sent!')
})
