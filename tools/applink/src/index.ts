#!/usr/bin/env node
// (C) 2020-2021 GoodData Corporation

import { program } from "commander";
import * as process from "process";
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
