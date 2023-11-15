const { AoiVoice, PlayerEvents, PluginName, Cacher, Filter } = require("@akarui/aoi.music"); //---
const voice = new AoiVoice(client, {
    searchOptions: {
        // soundcloudClientId: "Soundcloud ID", (optional)
        youtubegl: "US",
    },
    requestOptions: {
        offsetTimeout: 0,
        soundcloudLikeTrackLimit: 200,
    },
}); //--- // optional (cacher / filter)
voice.addPlugin(PluginName.Cacher, new Cacher("memory" /* or "disk" */));
voice.addPlugin(PluginName.Filter, new Filter({
    filterFromStart: false,
}));

voice.bindExecutor(client.functionManager.interpreter);