const sqlite3 = require("sqlite3");
const prettySeconds = require("pretty-seconds");
const { open } = require("sqlite");

async function vote(isUpVote, id, ownerId, type) {
  try {
    const db = await open({
      filename: "./scores.db",
      driver: sqlite3.Database,
    });

    // cooldown
    const now = new Date().getTime() / 1000;
    const normal = {
      time: 30,
      value: 1,
    };
    const silver = {
      time: 3600,
      value: 5,
    };
    const gold = {
      time: 86400,
      value: 10,
    };
    const plat = {
      time: 2592000,
      value: 50,
    };

    let values = [];
    let score = null;

    if (type === "normal") {
      values = [now + normal.time, now, now, now];
    }
    if (type === "silver") {
      values = [now, now + silver.time, now, now];
    }
    if (type === "gold") {
      values = [now, now, now + gold.time, now];
    }
    if (type === "plat") {
      values = [now, now, now, now + plat.time];
    }

    const owner = await db.get(
      "SELECT id FROM cooldowns WHERE id = ?",
      ownerId
    );
    let cooldown;
    if (owner === undefined) {
      await db.run(
        "INSERT INTO cooldowns VALUES (?, ?, ?, ?, ?)",
        ownerId,
        ...values
      );
      if (type === "normal") {
        cooldown = normal.time;
      }
      if (type === "silver") {
        cooldown = silver.time;
      }
      if (type === "gold") {
        cooldown = gold.time;
      }
      if (type === "plat") {
        cooldown = plat.time;
      }
    } else {
      if (type === "normal") {
        cooldown = (
          await db.get("SELECT voteExpire from cooldowns WHERE id = ?", ownerId)
        ).voteExpire;
      }
      if (type === "silver") {
        cooldown = (
          await db.get(
            "SELECT silverExpire from cooldowns WHERE id = ?",
            ownerId
          )
        ).silverExpire;
      }
      if (type === "gold") {
        cooldown = (
          await db.get("SELECT goldExpire from cooldowns WHERE id = ?", ownerId)
        ).goldExpire;
      }
      if (type === "plat") {
        cooldown = (
          await db.get("SELECT platExpire from cooldowns WHERE id = ?", ownerId)
        ).platExpire;
      }
    }

    if (parseInt(cooldown) > now) {
      return {
        ephemeral: true,
        content: `You must wait ${prettySeconds(
          cooldown - now
        )} to do that again`,
      };
    } else {
      // vote
      const result = await db.get("SELECT score FROM karma WHERE id = ?", id);
      let voteValue;
      if (type === "normal") {
        voteValue = normal.value;
      }
      if (type === "silver") {
        voteValue = silver.value;
      }
      if (type === "gold") {
        voteValue = gold.value;
      }
      if (type === "plat") {
        voteValue = plat.value;
      }

      if (result === undefined) {
        await db.run(
          "INSERT INTO karma VALUES (?, ?)",
          id,
          isUpVote ? voteValue : voteValue * -1
        );
      } else {
        score = isUpVote ? result.score + voteValue : result.score - voteValue;
        await db.run("UPDATE karma SET score = ? WHERE id = ?", score, id);
      }
    }

    if (type === "normal") {
      await db.run(
        "UPDATE cooldowns SET voteExpire = ? WHERE id = ?",
        now + normal.time,
        ownerId
      );
    }
    if (type === "silver") {
      await db.run(
        "UPDATE cooldowns SET silverExpire = ? WHERE id = ?",
        now + silver.time,
        ownerId
      );
    }
    if (type === "gold") {
      await db.run(
        "UPDATE cooldowns SET goldExpire = ? WHERE id = ?",
        now + gold.time,
        ownerId
      );
    }
    if (type === "plat") {
      await db.run(
        "UPDATE cooldowns SET platExpire = ? WHERE id = ?",
        now + plat.time,
        ownerId
      );
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
