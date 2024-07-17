/*
 * This is an example slash command which returns the bot's latency.
 * You can read the docs about those functions here:
 * https://aoi.js.org/functions/interactionReply
 * https://aoi.js.org/functions/pingms
*/   

module.exports = {
    name: "ping",
    // We use the "interaction" type to declare this as interaction.
    // https://aoi.js.org/guides/client/commands/#interaction-commands
    type: "interaction",
    // And we use the "slash" type because we want it to be a slash command
    // https://aoi.js.org/guides/application/commands
    prototype: "slash",
    code: `
        $interactionReply[
            Ping! $pingms
        ]
    `
}

// To use this command you'll have to create a slash command, which can be done by using the "create" command.
