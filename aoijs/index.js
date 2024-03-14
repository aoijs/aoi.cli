const { AoiClient, LoadCommands } = require("aoi.js");

const client = new AoiClient({
  token: "Discord Bot Token",
  prefix: "Discord Bot Prefix",
  intents: ["MessageContent", "Guilds", "GuildMessages"],
  events: ["onMessage", "onInteractionCreate"],
  database: {
    type: "aoi.db",
    db: require("@akarui/aoi.db"),
    dbType: "KeyValue",
    tables: ["main"],
    securityKey: "5c1dde866a1e16641d9ec9f61c272129",
  }
});

const loader = new LoadCommands(client);
loader.load(client.cmd, "./commands")