// (C) 2021-2023 GoodData Corporation
import { ActionOptions, TargetAppLanguage } from "../_base/types.js";
import { logError, logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import * as path from "path";
import fse from "fs-extra";
import tar from "tar";
import url from "url";
import { getDashboardPluginTemplateArchive } from "../dashboard-plugin-template.js";
import {
    convertToPluginDirectory,
    genericErrorReporter,
    readJsonSync,
    writeAsJsonSync,
} from "../_base/utils.js";
import { processTigerFiles } from "./processTigerFiles.js";
import { getInitCmdActionConfig, InitCmdActionConfig } from "./actionConfig.js";
import { FileReplacementSpec, replaceInFiles } from "./replaceInFiles.js";
import { sync as spawnSync } from "cross-spawn";

//
//
//

function unpackProject(target: string, language: TargetAppLanguage) {
    return fse.mkdirp(target).then((_) => {
        return tar.x({
            file: getDashboardPluginTemplateArchive(language),
            strip: 1,
            cwd: target,
        });
    });
}

const TigerBackendPackage = "@gooddata/sdk-backend-tiger";
const BearBackendPackage = "@gooddata/sdk-backend-bear";
const unnecessaryDevPkg = [
    "eslint-plugin-header",
    "eslint-plugin-import",
    "eslint-plugin-jest",
    "eslint-plugin-no-only-tests",
    "eslint-plugin-regexp",
    "eslint-plugin-sonarjs",
    "eslint-plugin-tsdoc",
];

/**
 * The original package.json can be tweaked now. The plugin name will be used for package name and
 * the dependency on unnecessary analytical backend impl will be dropped (bear backend dropped if tiger is
 * being used etc).
 *
 * @param target - target directory where the plugin template was expanded
 * @param config - config for the initialization action
 */
function modifyPackageJson(target: string, config: InitCmdActionConfig) {
    const { name, backend, packageManager } = config;
    const packageJsonFile = path.resolve(target, "package.json");
    const packageJson = readJsonSync(packageJsonFile);
    const { peerDependencies, devDependencies, overrides } = packageJson;
    const unnecessaryBackendPkg = backend === "bear" ? TigerBackendPackage : BearBackendPackage;

    packageJson.name = name;
    delete peerDependencies[unnecessaryBackendPkg];
    delete devDependencies[unnecessaryBackendPkg];

    unnecessaryDevPkg.forEach((key) => {
        delete devDependencies[key];
    });

    if (overrides && packageManager === "yarn") {
        delete packageJson.overrides;
        packageJson.resolutions = overrides;
    }

    writeAsJsonSync(packageJsonFile, packageJson);
}

/**
 * The original `plugin`, `plugin_entry` and `plugin_engine` directories must be renamed so that they are
 * uniquely named. This is due to 'webpack reasons'; when using module federation and loading multiple plugins,
 * each must have unique module federation id (understandable) AND its assets must be in its own unique directory
 * as well.
 *
 * @param target - target directory where the plugin template was expanded
 * @param config - config for the initialization action
 */
function renamePluginDirectories(target: string, config: InitCmdActionConfig) {
    fse.renameSync(path.join(target, "src", "plugin"), path.join(target, "src", config.pluginIdentifier));
    fse.renameSync(
        path.join(target, "src", "plugin_engine"),
        path.join(target, "src", `${config.pluginIdentifier}_engine`),
    );
    fse.renameSync(
        path.join(target, "src", "plugin_entry"),
        path.join(target, "src", `${config.pluginIdentifier}_entry`),
    );
}

function performReplacementsInFiles(dir: string, config: InitCmdActionConfig): Promise<void> {
    const { backend, hostname, workspace, dashboard, pluginIdentifier, language, packageManager } = config;
    const isTiger = backend === "tiger";
    const { protocol } = url.parse(hostname);
    const replacements: FileReplacementSpec = {
        "webpack.config.cjs": [
            {
                regex: /"\/gdc"/g,
                value: '"/api"',
                apply: isTiger,
            },
        ],
        ".env": [
            {
                regex: /BACKEND_URL=/g,
                value: `BACKEND_URL=${hostname}`,
            },
            {
                regex: /WORKSPACE=/g,
                value: `WORKSPACE=${workspace}`,
            },
            {
                regex: /DASHBOARD_ID=/g,
                value: `DASHBOARD_ID=${dashboard}`,
            },
        ],
        "README.md": [
            {
                regex: /\{\{packageManager\}\}/g,
                value: packageManager,
            },
            {
                regex: /\{\{pluginIdentifier\}\}/g,
                value: pluginIdentifier,
            },
            {
                regex: /\{\{language\}\}/g,
                value: language,
            },
            {
                regex: /\{\{protocol\}\}/g,
                value: protocol ?? "https:",
            },
        ],
        scripts: {
            "refresh-md.cjs": [
                {
                    regex: /const backend = "bear"/g,
                    value: 'const backend = "tiger"',
                    apply: isTiger,
                },
                {
                    regex: /full\.ts/g,
                    value: "full.js",
                    apply: language === "js",
                },
            ],
        },
        src: {
            "metadata.json": [
                {
                    regex: /"plugin"/g,
                    value: `"${pluginIdentifier}"`,
                },
            ],
            harness: {
                [`PluginLoader.${language}x`]: [
                    {
                        regex: /"\.\.\/plugin\/index\.js"/g,
                        value: `"../${pluginIdentifier}/index.js"`,
                    },
                ],
            },
            [pluginIdentifier]: {
                [`Plugin.${language}x`]: [
                    {
                        regex: /"\.\.\/plugin_entry\/index\.js"/g,
                        value: `"../${pluginIdentifier}_entry/index.js"`,
                    },
                ],
            },
        },
    };

    return replaceInFiles(dir, replacements);
}

/**
 * Prepares a new project for the plugin, according to the configuration obtained from CLI and/or by
 * prompting the user.
 *
 * The responsibility of this function is to create target directory, unpack the contents of the
 * appropriate plugin template archive and then 'massage' the unpacked files and directories:
 *
 * -  package json has to be modified
 * -  plugin, plugin_entry, plugin_engine directories have to be renamed so that they reflect the plugin name
 * -  backend-specific files have to be used where needed (or thrown away if not needed)
 * -  string replacements need to happen in the different files to reflect the renaming
 *
 * @param target - target directory to create plugin in
 * @param config - config for the initialization action
 */
async function prepareProject(target: string, config: InitCmdActionConfig): Promise<void> {
    const { language, backend } = config;

    await unpackProject(target, language);
    modifyPackageJson(target, config);

    await processTigerFiles(target, backend === "tiger");
    renamePluginDirectories(target, config);
    await performReplacementsInFiles(target, config);
}

function runInstall(target: string, config: InitCmdActionConfig): void {
    const { skipInstall, packageManager } = config;
    const isNpm = packageManager === "npm";

    if (skipInstall) {
        logWarn(
            `Skipping installation of plugin project dependencies. Make sure to run '${packageManager} install' in the plugin directory before you start developing.`,
        );

        return;
    }

    try {
        const args = ["install"];
        if (isNpm) {
            args.push("--legacy-peer-deps");
            logInfo("Command will run with '--legacy-peer-deps' flag.");
        }

        const result = spawnSync(packageManager, args, {
            cwd: target,
            stdio: ["ignore", "inherit", "inherit"],
        });

        if (result.status !== 0) {
            logWarn(
                `New project was created but the installation of dependencies has failed. Troubleshoot the problem in '${target}' and retry '${packageManager} install'.`,
            );

            return;
        }

        return;
    } catch (e) {
        logError(
            `An internal error has occurred while attempting to install project dependencies: ${
                (e as Error).message
            }`,
        );

        return;
    }
}

export async function initCmdAction(pluginName: string | undefined, options: ActionOptions): Promise<void> {
    try {
        logInfo(
            "You are about to create project for a new dashboard plugin. Please note that the " +
                "values of backend, hostname, workspace-id and dashboard-id options that you enter at this point " +
                "will be used primarily during development and testing of your new plugin. You will be able to " +
                "use the new plugin in production on other backend, workspace or dashboard regardless " +
                "of the choices you make at this point.",
        );

        const config = await getInitCmdActionConfig(pluginName, options);
        const { name, targetDir } = config;
        const target = targetDir ? targetDir : path.resolve(process.cwd(), convertToPluginDirectory(name));

        if (fse.existsSync(target)) {
            logError(
                `Directory for your new plugin already exists: ${target}. Either use a different plugin name or use --target-dir and specify a different directory.`,
            );

            process.exit(1);
        }

        await prepareProject(target, config);

        runInstall(target, config);

        logSuccess(
            `A new project for your dashboard plugin is ready in: ${target}. Check out the package.json and fill in author and description if possible.`,
        );
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
