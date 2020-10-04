#!/usr/bin/env node
// (C) 2020 GoodData Corporation

import program from "commander";
import * as process from "process";
import * as pkg from "../package.json";
import { devConsole } from "./devConsole/action";

program
    .version(pkg.version)
    .command("devConsole <path>")
    .description("Starts development console for SDK dependencies of the application residing in <path>")
    .action(devConsole);

async function run() {
    program.parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
}

run().catch((err) => {
    console.error(`An unexpected error has occurred: ${err}`);
    console.error(err);

    process.exit(1);
});
