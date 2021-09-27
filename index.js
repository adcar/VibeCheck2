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
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "d") {
    const { id, username } = interaction.options.getMember("target").user;
    try {
      const score = await vote(false, id);
      await interaction.reply(
        `Cringe, bluepilled, etc. ${username}'s score is now ${score}`
      );
    } catch (e) {
      await interaction.reply("Something went wrong, try again later");
    }
  }

  if (interaction.commandName === "u") {
    const { id, username } = interaction.options.getMember("target").user;
    try {
      const score = await vote(true, id);
      await interaction.reply(
        `Cringe, bluepilled, etc. ${username}'s' score is now ${score}`
      );
    } catch (e) {
      await interaction.reply("Something went wrong, try again later");
    }
  }

  if (interaction.commandName === "score") {
    try {
      const table = await getScores(client);
      await interaction.reply("```\n" + table + "```");
    } catch (e) {
      await interaction.reply("Something went wrong, try again later");
    }
  }
});

client.login("NjY3ODA5MzE1NjE2MzI1NjY4.XiIH5A.eTEPTPIy1tUMwqYkmD_J9Zfp_4w");
