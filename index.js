const { AoiVoice, PlayerEvents, PluginName, Cacher, Filter } = require("@akarui/aoi.music"); 
const { AoiClient } = require("aoi.js");
const client = new AoiClient({
  token: "[36m>[39m Project Directory: [90mPress enter to skip[39m ",
  prefix: "!",
  intents: ["Guilds", "GuildMessages", "GuildVoiceStates", "GuildMembers"],
  events: ["onInteractionCreate", "onMessage"],
  database: {
    type: "aoi.db",
    db: require("@akarui/aoi.db"),
    dbType: "KeyValue",
    tables: ["main"],
    securityKey: "429901d585fc00cc111c7809eb921a4e",
  },
});

client.command({
  name: "ping",
  code: `Pong! $pingMS`,
});

// Add more commands or event handlers here


const voice = new AoiVoice(client, {
    searchOptions: {
        // soundcloudClientId: "Soundcloud ID", (optional)
        youtubegl: "US",
    },
    requestOptions: {
        offsetTimeout: 0,
        soundcloudLikeTrackLimit: 200,
    },
}); 

 // optional (cacher / filter)
voice.addPlugin(PluginName.Cacher, new Cacher("memory" /* or "disk" */));
voice.addPlugin(PluginName.Filter, new Filter({
    filterFromStart: false,
}));

voice.bindExecutor(client.functionManager.interpreter);