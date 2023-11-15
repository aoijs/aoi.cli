const { ClientShard } = require("aoi.js");

const sharder = new ClientShard("./index.js", {
  // Your main file, in this case called "index.js".
  token: "{TOKEN}", // Your Discord Bot token.
  totalShards: 3, // The amount of shards/instances you want to create, in this case three.
});

sharder.on("shardCreate", (shard) => console.log(`Launched shard ${shard.id}`)); // Used for debugging, can be removed.
sharder.startProcess(); // Starts the sharding process.
