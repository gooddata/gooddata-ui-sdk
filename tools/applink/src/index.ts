#!/usr/bin/env node
// (C) 2007-2020 GoodData Corporation

import program from "commander";
import * as process from "process";
import * as pkg from "../package.json";
import { logError, logInfo } from "./cli/loggers";

program.version(pkg.version).parse(process.argv);

async function run() {
    logInfo(`program ${program}`);
}

run().catch((err) => {
    logError(`An unexpected error has occurred: ${err}`);
    console.error(err);

    process.exit(1);
});
