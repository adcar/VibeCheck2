const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const vote = require("./vote");
const getScores = require("./score");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [
  new SlashCommandBuilder()
    .setName("d")
    .setDescription("Downvotes a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("u")
    .setDescription("Upvotes a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("silver")
    .setDescription("Silvers a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("gold")
    .setDescription("Golds a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("plat")
    .setDescription("Platinums a user")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("vibecheck")
    .setDescription("Checks a user's vibe")
    .addUserOption((option) =>
      option.setName("target").setDescription("The user").setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("score")
    .setDescription("Show the scoreboard"),
];

const rest = new REST({ version: "9" }).setToken(
  "NjY3ODA5MzE1NjE2MzI1NjY4.XiIH5A.eTEPTPIy1tUMwqYkmD_J9Zfp_4w"
);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        "667809315616325668",
        "664671034825375754"
      ),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  async function _vote(isUpvote, message, type) {
    const { id, username } = interaction.options.getMember("target").user;
    if (id === interaction.user.id) {
      return await interaction.reply({
        ephemeral: true,
        content: "You can't vote on yourself",
      });
    }
    try {
      const res = await vote(isUpvote, id, interaction.user.id, type);

      if (typeof res === "object") {
        await interaction.reply(res);
      } else {
        await interaction.reply(message + ` ${username}'s score is now ${res}`);
      }
    } catch (e) {
      await interaction.reply({
        ephemeral: true,
        content: "`" + e + "`",
      });
    }
  }
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "d") {
    _vote(false, "Cringe, bluepilled, etc.", "normal");
  }

  if (interaction.commandName === "u") {
    _vote(true, "Based (and redpilled).", "normal");
  }

  if (interaction.commandName === "silver") {
    _vote(true, "Oh... silver... couldn't afford gold?", "silver");
  }

  if (interaction.commandName === "gold") {
    _vote(true, "Edit: Thanks for the gold kind stranger!", "gold");
  }

  if (interaction.commandName === "plat") {
    _vote(true, "OMGOMGGOMGOMGGGGGG PLAT??!?!?!?!", "plat");
  }

  if (interaction.commandName === "score") {
    try {
      const table = await getScores(client);
      await interaction.reply("```\n" + table + "```");
    } catch (e) {
      await interaction.reply({
        ephemeral: true,
        content: "`" + e + "`",
      });
    }
  }

  if (interaction.commandName === "vibecheck") {
    const { id, username } = interaction.options.getMember("target").user;

    if (id === interaction.user.id) {
      return await interaction.reply(
        "Vibechecking yourself? I can tell you right now you ain't vibin..."
      );
    }

    if (Math.round(Math.random()) === 1 && id !== "194997493078032384") {
      await interaction.reply(`${username} passed the vibecheck`);
    } else {
      await interaction.reply(`${username} has failed the vibecheck`);
    }
  }
});

client.login("NjY3ODA5MzE1NjE2MzI1NjY4.XiIH5A.eTEPTPIy1tUMwqYkmD_J9Zfp_4w");

