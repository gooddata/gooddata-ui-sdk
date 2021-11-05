#!/usr/bin/env node
// (C) 2021 GoodData Corporation

import { Command, OptionValues, program } from "commander";
import * as pkg from "../package.json";
import { addPluginCmdAction } from "./addPluginCmd";
import { initCmdAction } from "./initCmd";
import { usePluginCmdAction } from "./usePluginCmd";

program
    .version(pkg.version)
    .name("GoodData Plugin Development Toolkit")
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .option("--hostname <hostname>", "URL of your GoodData host");

const dashboardCmd = program
    .command("dashboard-plugin")
    .description("Commands to work with dashboard plugins.");

const initCmd: Command = dashboardCmd
    .command("init")
    .description("Initialize a new dashboard plugin")
    .argument("[plugin-name]", "Name of the plugin to create")
    .option(
        "--backend <backend>",
        "Type of backend against which you want to develop the plugin, either GoodData Platform (bear) or GoodData.CN (tiger)",
    )
    .option(
        "--language <language>",
        "Programming language to use for plugin. Either TypeScript (ts) or JavaScript (js)",
    )
    .option(
        "--workspace-id <workspace>",
        "Identifier of workspace that contains dashboard that you want to enhance using a plugin",
    )
    .option("--dashboard-id <dashboard>", "Identifier of dashboard that you want to enhance using a plugin")
    .option(
        "--target-dir <path>",
        "Path to the directory to create the plugin in. If not " +
            "specified, program will create a new subdirectory with name derived from plugin name in the current working directory",
    )
    .option("--package-manager <package-manager>", "Package manager to use in the plugin project", "npm")
    .option("--skip-install", "Skip installing the plugin dependencies", false)
    .action(async (pluginName) => {
        acceptUntrustedSsl(program.opts());

        return initCmdAction(pluginName, {
            programOpts: program.opts(),
            commandOpts: initCmd.opts(),
        });
    });

const addPluginCmd: Command = dashboardCmd
    .command("store")
    .description("Store plugin in a workspace so that it can be used on the dashboards in that workspace")
    .argument(
        "[plugin-url]",
        "URL of location where the plugin assets are hosted. The URL must use https protocol",
    )
    .option("--username <email>", "Your username that you use to log in to GoodData platform")
    .option("--workspace-id <id>", "Identifier of workspace to which you want to add the plugin")
    .action(async () => {
        acceptUntrustedSsl(program.opts());

        return addPluginCmdAction({
            programOpts: program.opts(),
            commandOpts: addPluginCmd.opts(),
        });
    });

const usePluginCmd: Command = dashboardCmd
    .command("use")
    .description("Use plugin available in a workspace on a dashboard.")
    .argument("[plugin-id]", "Plugin id which you want to use on the dashboard")
    .option("--username <email>", "Your username that you use to log in to GoodData platform")
    .option(
        "--workspace-id <id>",
        "Identifier of workspace that contains dashboard that should use the plugin",
    )
    .option("--dashboard-id <id>", "Identifier of dashboard on which you want to use the plugin")
    .option(
        "--with-parameters",
        "Tool will prompt for parameters that will be passed to plugin during initialization",
    )
    .action(async () => {
        acceptUntrustedSsl(program.opts());

        return usePluginCmdAction({
            programOpts: program.opts(),
            commandOpts: usePluginCmd.opts(),
        });
    });

program.parse(process.argv);

function acceptUntrustedSsl(options: OptionValues) {
    if (options.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
}
