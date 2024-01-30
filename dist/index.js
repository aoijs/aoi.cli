// checking for the type of command to be executed
const input = process.argv;
if (input.includes("upgrade")) {
    //@ts-ignore
    import("../dist/upgrade.js");
}
else if (input.includes("create")) {
    // create new aoi.js project
    //@ts-ignore
    import("../dist/create.js");
}
else if (input.includes("help")) {
    // list all available commands and current version
    //@ts-ignore
    import("../dist/help.js");
}
else {
    // fallback, list all available commands and current version
    //@ts-ignore
    import("../dist/help.js");
}
