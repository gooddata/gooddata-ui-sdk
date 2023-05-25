#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { Command, OptionValues, program } from "commander";
import pkg from "../package.json" assert { type: "json" };
import { addPluginCmdAction } from "./addPluginCmd/index.js";
import { initCmdAction } from "./initCmd/index.js";
import { linkPluginCmdAction } from "./linkPluginCmd/index.js";
import { unlinkPluginCmdAction } from "./unlinkPluginCmd/index.js";
import { listCmdAction } from "./listCmds/listCmdAction.js";
import { listDashboards } from "./listCmds/listDashboards.js";
import { listDashboardPlugins } from "./listCmds/listDashboardPlugins.js";
import { inspectCmdAction } from "./inspectCmds/inspectCmdAction.js";
import { inspectDashboard } from "./inspectCmds/inspectDashboard.js";
import { updatePluginParamCmdAction } from "./updatePluginParamsCmd/index.js";
import { removePluginParamCmdAction } from "./removeParamsCmd/index.js";

program
    .version(pkg.version)
    .name("GoodData Plugin Development Toolkit")
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .option("--hostname <hostname>", "URL of your GoodData host")
    .option(
        "--backend <backend>",
        "Type of backend against that you are targeting. Either GoodData Platform (bear) or GoodData.CN (tiger)",
    );

const dashboardCmd = program
    .command("dashboard-plugin")
    .description("Commands to work with dashboard plugins.");

const listCmd = program
    .command("list")
    .description("Commands to list workspace metadata.")
    .option("--workspace-id <workspace>", "Identifier of workspace whose objects you want to list.");

const listDashboardsCmd = listCmd
    .command("dashboards")
    .description("List workspace dashboards")
    .action(async () => {
        acceptUntrustedSsl(program.opts());

        await listCmdAction(listDashboards, {
            programOpts: program.opts(),
            commandOpts: {
                ...listCmd.opts(),
                ...listDashboardsCmd.opts(),
            },
        });
    });

const listDashboardPluginsCmd = listCmd
    .command("dashboardPlugins")
    .description("List workspace dashboard plugins")
    .action(async () => {
        acceptUntrustedSsl(program.opts());

        await listCmdAction(listDashboardPlugins, {
            programOpts: program.opts(),
            commandOpts: {
                ...listCmd.opts(),
                ...listDashboardPluginsCmd.opts(),
            },
        });
    });

const inspectCmd = program
    .command("inspect")
    .description("Commands to inspect workspace metadata objects.")
    .option("--workspace-id <workspace>", "Identifier of workspace whose object you want to inspect.");

const inspectDashboardCmd = inspectCmd
    .command("dashboard")
    .argument("<identifier>", "Dashboard identifier")
    .description("Inspect workspace dashboard")
    .action(async (identifier: string) => {
        acceptUntrustedSsl(program.opts());

        await inspectCmdAction(identifier, inspectDashboard, {
            programOpts: program.opts(),
            commandOpts: {
                ...inspectCmd.opts(),
                ...inspectDashboardCmd.opts(),
            },
        });
    });

const initCmd: Command = dashboardCmd
    .command("init")
    .description("Initialize a new dashboard plugin")
    .argument(
        "[plugin-name]",
        "Name of the plugin to create. Plugin name will be used to " +
            "create a new subdirectory for the plugin project. The program expects that the subdirectory does not exist",
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
            "specified, program will create a new subdirectory with name derived from plugin name in the " +
            "current working directory. The program expects that the subdirectory does not exist",
    )
    .option("--package-manager <package-manager>", "Package manager to use in the plugin project", "npm")
    .option("--skip-install", "Skip installing the plugin dependencies", false)
    .action(async (pluginName) => {
        acceptUntrustedSsl(program.opts());

        await initCmdAction(pluginName, {
            programOpts: program.opts(),
            commandOpts: initCmd.opts(),
        });
    });

const addPluginCmd: Command = dashboardCmd
    .command("add")
    .description("Add plugin into a workspace so that it can be used on the dashboards in that workspace")
    .argument(
        "<plugin-url>",
        "URL of location where the plugin assets are hosted. The URL must use https protocol",
    )
    .option(
        "--workspace-id <id>",
        "Identifier of workspace to which you want to add the plugin. " +
            "By default uses workspace from your .env file.",
    )
    .option(
        "--dry-run",
        "In dry run mode, the tool will proceed up to the point when first update operation has to " +
            "be done and then will stop. This is ideal to verify configuration. Dry run is disabled by default",
        false,
    )
    // not doing this now; it may be a nice convenience but let's not overdo it
    //
    // .option("--no-env", "By default, if you do not provide hostname and workspace on the CLI, " +
    //     "the tool will try to read and use values in your .env file. If you add this option, then hostname " +
    //     "and workspace will not be read from .env and you will be prompted instead.", false)
    .action(async (pluginUrl) => {
        acceptUntrustedSsl(program.opts());

        await addPluginCmdAction(pluginUrl, {
            programOpts: program.opts(),
            commandOpts: addPluginCmd.opts(),
        });
    });

const linkPluginCmd: Command = dashboardCmd
    .command("link")
    .description("Link plugin available in a workspace with a dashboard in the same workspace.")
    .argument("<plugin-id>", "Plugin id which you want to link with the dashboard")
    .option(
        "--workspace-id <id>",
        "Identifier of workspace that contains dashboard and plugin that should be linked",
    )
    .option("--dashboard-id <id>", "Identifier of dashboard to which you want to link the plugin")
    .option(
        "--dry-run",
        "In dry run mode, the tool will proceed up to the point when first update operation has to " +
            "be done and then will stop. This is ideal to verify configuration. Dry run is disabled by default",
        false,
    )
    .option(
        "--with-parameters",
        "Indicate that the link between dashboard and plugin should be parameterized. When you specify " +
            "this option the program will open an editor for you to enter parameters that should be passed to the linked " +
            "plugin as it is loaded on the dashboard.",
    )
    .action(async (identifier) => {
        acceptUntrustedSsl(program.opts());

        await linkPluginCmdAction(identifier, {
            programOpts: program.opts(),
            commandOpts: linkPluginCmd.opts(),
        });
    });

const unlinkPluginCmd: Command = dashboardCmd
    .command("unlink")
    .description("Unlink plugin from a dashboard.")
    .argument("<plugin-id>", "Identifier of the plugin object which you want to unlink from the dashboard.")
    .option(
        "--workspace-id <id>",
        "Identifier of workspace that contains dashboard that should use the plugin",
    )
    .option("--dashboard-id <id>", "Identifier of dashboard on which you want to use the plugin")
    .option(
        "--dry-run",
        "In dry run mode, the tool will proceed up to the point when first update operation has to " +
            "be done and then will stop. This is ideal to verify configuration. Dry run is disabled by default",
        false,
    )
    .action(async (identifier) => {
        acceptUntrustedSsl(program.opts());

        await unlinkPluginCmdAction(identifier, {
            programOpts: program.opts(),
            commandOpts: unlinkPluginCmd.opts(),
        });
    });

const updatePluginParamsCmd: Command = dashboardCmd
    .command("update-params")
    .description("Updates the parameter for the already linked plugin.")
    .argument("<plugin-id>", "Identifier of the plugin object which you want to modify parameters for.")
    .option(
        "--workspace-id <id>",
        "Identifier of the workspace that contains dashboard that should use the plugin.",
    )
    .option("--dashboard-id <id>", "Identifier of the dashboard on which you want to update the plugin.")
    .option(
        "--dry-run",
        "In dry run mode, the tool will proceed up to the point when first update operation has to " +
            "be done and then will stop. This is ideal to verify configuration. Dry run is disabled by default",
        false,
    )
    .action(async (identifier) => {
        acceptUntrustedSsl(program.opts());

        await updatePluginParamCmdAction(identifier, {
            programOpts: program.opts(),
            commandOpts: updatePluginParamsCmd.opts(),
        });
    });

const removePluginParamsCmd: Command = dashboardCmd
    .command("remove-params")
    .description("Removes the parameter for the already linked plugin.")
    .argument("<plugin-id>", "Identifier of the plugin object which you want to modify parameters for.")
    .option(
        "--workspace-id <id>",
        "Identifier of the workspace that contains dashboard that should use the plugin.",
    )
    .option("--dashboard-id <id>", "Identifier of the dashboard on which you want to update the plugin.")
    .option(
        "--dry-run",
        "In dry run mode, the tool will proceed up to the point when first update operation has to " +
            "be done and then will stop. This is ideal to verify configuration. Dry run is disabled by default",
        false,
    )
    .action(async (identifier) => {
        acceptUntrustedSsl(program.opts());

        await removePluginParamCmdAction(identifier, {
            programOpts: program.opts(),
            commandOpts: removePluginParamsCmd.opts(),
        });
    });

program.parse(process.argv);

function acceptUntrustedSsl(options: OptionValues) {
    if (options.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
}
