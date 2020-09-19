#!/usr/bin/env node
// (C) 2007-2020 GoodData Corporation

import program from "commander";
import * as process from "process";
import * as path from "path";
import * as pkg from "../package.json";
import { logError, logInfo } from "./cli/loggers";
import { getSdkPackages } from "./tool/sdkPackages";
import { findSdkDependencies } from "./tool/dependencyDiscovery";

program
    .version(pkg.version)
    .command("devTo <path>")
    .description("Links SDK libraries to an application residing in <path>")
    .action(devTo);

async function devTo(target: string) {
    const sdkPackages = await getSdkPackages();

    if (!sdkPackages) {
        return;
    }

    const absolutePath = path.resolve(target);
    logInfo(`devTo: ${absolutePath}`);

    const dependencies = findSdkDependencies(absolutePath, sdkPackages);

    if (!dependencies.length) {
        logInfo(`The target project does not have any dependencies on the SDK. There is nothing to do.`);

        return 1;
    }

    logInfo(
        `The target project references the following SDK libraries (${
            dependencies.length
        }):\n\t\t\t${dependencies.map((dep) => `${dep.pkg.packageName} @ ${dep.version}`).join("\n\t\t\t")}`,
    );
}

async function run() {
    program.parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
}

run().catch((err) => {
    logError(`An unexpected error has occurred: ${err}`);
    console.error(err);

    process.exit(1);
});
