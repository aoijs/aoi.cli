const { AoiClient } = require("aoi.js");

const client = new AoiClient({
  token: "{TOKEN}",
  prefix: "{PREFIX}",
  intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "MessageContent", "GuildMembers"],
  events: ["onInteractionCreate", "onMessage"],
  database: {
    type: "aoi.db",
    db: require("@akarui/aoi.db"),
    dbType: "KeyValue",
    tables: ["main"],
    securityKey: "{KEY}",
  },
});

client.command({
  name: "ping",
  code: `Pong! $pingMS`,
});

// Add more commands or event handlers here
