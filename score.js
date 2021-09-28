const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const AsciiTable = require("ascii-table");
const { banish } = require("@favware/zalgo");
const score = require("./score");

async function getScores(client) {
  try {
    const db = await open({
      filename: "./scores.db",
      driver: sqlite3.Database,
    });
    const result = await db.all("SELECT * FROM karma");
    await db.close();

    const table = new AsciiTable("Scoreboard");
    table.setHeading("User", "Score");

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
    users.forEach(({ userDetails, score }, index) =>
      table.addRow(banish(userDetails.username), score)
    );

    table.sortColumn(1, function (a, b) {
      return a - b;
    });

    return table.toString();
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong");
  }
}

module.exports = getScores;
