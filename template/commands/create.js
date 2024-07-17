/*
 * This command creates a new slash command for the "ping" command.
 * You only have to execute this **once** and never again.
 * https://aoi.js.org/guides/application/commands
*/

module.exports = {
    name: "create",
    code: `
        Created the slash command!

        $createApplicationCommand[
            global;ping;Returns the bot's latency!;true;true;slash
        ]
    `
}