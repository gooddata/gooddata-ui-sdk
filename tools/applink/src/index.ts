#!/usr/bin/env node
// (C) 2020-2021 GoodData Corporation

import program from "commander";
import * as process from "process";
import * as pkg from "../package.json";
import { autoBuild, devConsole } from "./devConsole/action";
import { findImpacted } from "./findImpacted";

program
    .version(pkg.version)
    .command("devConsole <path>")
    .description("Starts development console for SDK dependencies of the application residing in <path>")
    .action(devConsole);

program
    .command("autoBuild")
    .description(
        "Starts development console in auto-build mode where changes to all SDK libraries and tools will be monitored for changes and incremental builds will be started according to dependencies.",
    )
    .action(autoBuild);

program
    .command("findImpacted")
    .description(
        "Given a list of modified file paths incoming on stdin, this command will return all impacted packages. The paths should be relative to repository root. Example: `git diff --name-only upstream/master origin/master`",
    )
    .action(findImpacted);

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
