#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { program } from "commander";
import { initCmdAction } from "./initCmd/index.js";
import { LIB_NAME, LIB_DESCRIPTION, LIB_VERSION } from "./__version.js";

program.name(LIB_NAME).description(LIB_DESCRIPTION).version(LIB_VERSION);

export const initCmd = program
    .command("init")
    .description("initializes a new GoodData application.")
    .argument(
        "[app-name]",
        "Name of the application to create. Application name will be used to " +
            "create a new subdirectory for the project. The program expects that the subdirectory does not exist",
    )
    .option(
        "--language <language>",
        "Programming language to use for app. Either TypeScript (ts) or JavaScript (js)",
    )
    .option("--package-manager <package-manager>", "Package manager to use in the application project", "npm")
    .option("--template <template>", "Template to use for the application", "react-app")
    .option(
        "--target-dir <path>",
        "Path to the directory to create the app in. If not " +
            "specified, program will create a new subdirectory with name derived from app name in the " +
            "current working directory. The program expects that the subdirectory does not exist",
    )
    .option("--skip-install", "Skip installing the application dependencies", false)
    .action(async (appName) => {
        await initCmdAction(appName, {
            programOpts: program.opts(),
            commandOpts: initCmd.opts(),
        });
    });

program.parse(process.argv);
