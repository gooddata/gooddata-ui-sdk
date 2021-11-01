// (C) 2021 GoodData Corporation

import { Command, program } from "commander";
import * as pkg from "../package.json";
import { addPluginCmdAction } from "./addPluginCmd";
import { initCmdAction } from "./initCmd";
import { usePluginCmdAction } from "./usePluginCmd";

program
    .version(pkg.version)
    .name("GoodData Plugin Development Toolkit")
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .option("--hostname <hostname>", "URL of your GoodData host")
    .option("-c, --config <config>", "path to configuration file");

const dashboardCmd = program
    .command("dashboard-plugin")
    .description("Commands to work with dashboard plugins.");

const initCmd: Command = dashboardCmd
    .command("init")
    .description("Initialize a new dashboard plugin")
    .argument("[plugin-name]", "Name of the plugin to create")
    .option("--target-dir <path>", 'Path to the directory to create the plugin in (default: ".")')
    .option("--no-install", "Skip yarn installing the plugin dependencies")
    .option("--verbose", "Output additional logs, useful mainly for debugging and bug reports")
    .option("--backend <backend>", "Setting backend of the app (default: bear backend)")
    .option("--flavor <flavor>", "Language flavor of the plugin, either TypeScript (ts) or JavaScript (js)")
    .action(async (pluginName) => {
        return initCmdAction(pluginName, {
            programOpts: program.opts(),
            commandOpts: initCmd.opts(),
        });
    });

const addPluginCmd: Command = dashboardCmd
    .command("store")
    .description("Store plugin in a workspace so that it can be used on the dashboards in that workspace.")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option("--workspace-id <id>", "Workspace id to which you want to add the plugin.")
    .action(async () => {
        return addPluginCmdAction({
            programOpts: program.opts(),
            commandOpts: addPluginCmd.opts(),
        });
    });

const usePluginCmd: Command = dashboardCmd
    .command("use")
    .argument("[plugin-id]", "Plugin id which you want to use on the dashboard.")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option("--workspace-id <id>", "Workspace id that contains dashboard that should use the plugin.")
    .option("--dashboard-id <id>", "Dashboard id on which you want to use the plugin.")
    .option(
        "--with-parameters",
        "Tool will prompt for parameters that will be passed to plugin during initialization.",
    )
    .description("Use plugin available in a workspace on a dashboard.")
    .action(async () => {
        return usePluginCmdAction({
            programOpts: program.opts(),
            commandOpts: usePluginCmd.opts(),
        });
    });

program.parse(process.argv);
