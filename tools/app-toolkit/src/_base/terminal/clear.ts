// (C) 2007-2022 GoodData Corporation
import * as readline from "readline";

export function clearTerminal(clr: boolean = true): void {
    if (clr) {
        process.stdout.write("\x1b[2J\x1b[H");
    }
    process.stdout.write("\x1b[2K\x1b[G");
}

export function clearLine(): void {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
}
