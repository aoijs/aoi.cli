// checking for the type of command to be executed
const input = process.argv;
if (input.includes("upgrade")) {
    //@ts-ignore
    import("./upgrade.js");
}
else if (input.includes("create")) {
    // create new aoi.js project
    //@ts-ignore
    import("./create.js");
}
else if (input.includes("help")) {
    // list all available commands and current version
    //@ts-ignore
    import("./help.js");
}
else {
    // fallback, list all available commands and current version
    //@ts-ignore
    import("./help.js");
}
