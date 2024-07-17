/*
 * This is a simple command to get the avatar of the user who executed the command.
 * You can read the docs about those functions here:
 * https://aoi.js.org/functions/attachment
 * https://aoi.js.org/functions/authoravatar
*/ 

module.exports = {
    name: "avatar",
    code: `
        Here's your avatar!
        $attachment[$authorAvatar;avatar.webp;url]
    `
}