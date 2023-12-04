const { AoiClient } = require("aoi.js");

const client = new AoiClient({
  token: "{TOKEN}",
  prefix: "{PREFIX}",
  intents: ["Guilds", "GuildMessages", "MessageContent"],
  events: ["onMessage", "onInteractionCreate"],
  database: {
    type: "aoi.db",
    db: require("@akarui/aoi.db"),
    dbType: "KeyValue",
    tables: ["main"],
    securityKey: "{KEY}",
  },
});

client.loadCommands("./commands/", true); // the handler part

client.command({
  name: "ping",
  code: `Pong! $pingMS`,
});

// Add more commands or event handlers here