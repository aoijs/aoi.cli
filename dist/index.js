import { upgrade } from '../dist/upgrade.js';
import { help } from '../dist/help.js';
import { join } from 'path';
const input = process.argv;
let loc;
const commands = ['upgrade', 'create', 'help'];
const command = input.find((arg) => commands.includes(arg));
switch (command) {
    case 'upgrade':
        // If the "--dir" argument is provided, use its value as the location
        // Otherwise, use the current working directory
        loc = join(process.cwd(), input.indexOf('--dir') === -1 ? './' : input[input.indexOf('--dir') + 1]);
        upgrade(loc);
        break;
    case 'create':
        // If the "--dir" argument is provided, use its value as the location
        // Otherwise, use "aoijs" in the current working directory
        loc = join(process.cwd(), input.indexOf('--dir') === -1 ? './aoijs' : input[input.indexOf('--dir') + 1]);
        import('../dist/create.js');
        break;
    case 'help':
    default:
        // If no command is provided, or if the command is "help", show the help message
        help(input[2]);
        break;
}
//# sourceMappingURL=index.js.map