const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const AsciiTable = require("ascii-table");
const { banish } = require("@favware/zalgo");
const score = require("./score");


// https://stackoverflow.com/a/8837505/6501208
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

async function getScores(client) {
  try {
    const db = await open({
      filename: "./scores.db",
      driver: sqlite3.Database,
    });
    const result = await db.all("SELECT * FROM karma");
    await db.close();

    const table = new AsciiTable("Scoreboard");
    table.setHeading("Rank", "User", "Score");

    const userPromises = result.map(
      ({ id, score }) =>
        new Promise(async (resolve, reject) => {
          try {
            const userDetails = await client.users.fetch(id);
            resolve({
              score,
              userDetails,
            });
          } catch (e) {
            reject(e);
          }
        })
    );

    const users = await Promise.all(userPromises);

    let tableArray = [];
    users.forEach(({ userDetails, score }, index) =>
        tableArray.push({user: banish(userDetails.username), score})
    );

    sortByKey(tableArray, score);

    users.forEach((user, index) => {
        table.addRow(index, user.user, user.score)
    })
    
    return table.toString();
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong");
  }
}

module.exports = getScores;
