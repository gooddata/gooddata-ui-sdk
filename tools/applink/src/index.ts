#!/usr/bin/env node
// (C) 2020-2026 GoodData Corporation

import * as process from "process";

import { program } from "commander";

import { autoBuild, devConsole } from "./devConsole/action.js";

program
    .version("1.0.0")
    .command("devConsole <path>")
    .description("Starts development console for SDK dependencies of the application residing in <path>")
    .action(devConsole);

program
    .command("autoBuild")
    .description(
        "Starts development console in auto-build mode where changes to all SDK libraries and tools will be monitored for changes and incremental builds will be started according to dependencies.",
    )
    .action(autoBuild);

function run() {
    program.parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
}

try {
    run();
} catch (err: any) {
    console.error(`An unexpected error has occurred: ${err}`);
    console.error(err);

    process.exit(1);
}
