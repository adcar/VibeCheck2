const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function vote(isUpVote, id) {
  try {
    const db = await open({
      filename: "./scores.db",
      driver: sqlite3.Database,
    });

    const result = await db.get("SELECT score FROM karma WHERE id = ?", id);


    let score = null;
    if (result === undefined) {
      await db.run("INSERT INTO karma VALUES (?, ?)", id, isUpVote ? 1 : -1);
    } else {
      score = isUpVote ? result.score + 1 : result.score - 1;
      await db.run("UPDATE karma SET score = ? WHERE id = ?", score, id);
    }

    await db.close();
    
    if (score === null) {
      return isUpVote ? 1 : -1;
    } else {
      return score;
    }
    
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong");
  }
}

module.exports = vote;
