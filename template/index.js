// This imports the Client for our bot, which is required to run the bot.
const { AoiClient } = require("aoi.js");

const client = new AoiClient({
    token: process.env.DISCORD_BOT_TOKEN,
    // You can customize the prefix by changing the value of the "prefix" property, 
    // if you want multiple, just use an array like this: ["!", "?", "."]
    prefix: "!",
    // These are required for your bot to "read" messages, if you don't have any of those intents,
    // then you are bound to bot mention prefixes and interaction commands.
    intents: ["MessageContent", "Guilds", "GuildMessages"],
    // We use these events to interact with the bot, onMessage allows us to "respond" to commands,
    // and onInteractionCreate allows us to "respond" to interaction
    // https://aoi.js.org/guides/other/events
    events: ["onMessage", "onInteractionCreate"],
    // You can find more client options here:
    // https://aoi.js.org/guides/client/options
});

// A simple ping command, which replies when using [PREFIX]ping
// https://aoi.js.org/guides/client/commands
client.command({
    name: "ping",
    code: `Pong! $pingms`
});

// This allows us to store our commands in an external folder, which decreases the amount of code you have in this file.
// https://aoi.js.org/guides/client/commands#command-handler
client.loadCommands("./commands");