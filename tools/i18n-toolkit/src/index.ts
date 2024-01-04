#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { program } from "commander";

import { DefaultConfigName, ToolkitOptions, ToolkitConfigFile } from "./data.js";
import { validate } from "./validate.js";
import { configure } from "./config.js";
import { done, fail, error, hr } from "./utils/console.js";

async function loadConfig(cwd: string, opts: ToolkitOptions) {
    const { debug } = opts;

    try {
        return await configure(cwd, opts);
    } catch (err: any) {
        hr(debug);
        fail("Can not process localisation config file!", true);
        error(err, debug);
        process.exit(1);
    }
}

async function runValidation(cwd: string, config: ToolkitConfigFile) {
    const { debug } = config;

    try {
        await validate(cwd, config);
        hr(debug);
        done("Localizations are valid!", true);
        process.exit(0);
    } catch (err: any) {
        hr(debug);
        fail("Localizations are invalid!", true);
        error(err, debug);
        process.exit(1);
    }
}

program
    .option("-w, --cwd <type>", `path to current working directory, default is "${process.cwd()}"`)
    .option("-p, --paths <type...>", "paths to more translations separated by space")
    .option("-c, --config <type>", `path to config file, default is "${DefaultConfigName}"`)
    .option("-s, --structure", "enable structure check")
    .option("-i, --intl", "enable intl check")
    .option("-h, --html", "enable html check")
    .option("-r, --insightToReport", "enable insightToReport check")
    .option("-u, --usage", "enable usage of messages check")
    .option("-d, --debug", "enable debug mode")
    .action(async (opts: ToolkitOptions) => {
        const cwd = opts.cwd || process.cwd();
        const config = await loadConfig(cwd, opts);
        await runValidation(cwd, config);
    });

program.parse(process.argv);
