// (C) 2021 GoodData Corporation
import { ActionOptions, TargetAppLanguage } from "../_base/types";
import { logError, logInfo } from "../_base/cli/loggers";
import kebabCase from "lodash/kebabCase";
import * as path from "path";
import fse from "fs-extra";
import tar from "tar";
import { getDashboardPluginTemplateArchive } from "../dashboard-plugin-template";
import { readJsonSync, writeAsJsonSync } from "../_base/utils";
import { isInputValidationError } from "../_base/cli/validators";
import { processTigerFiles } from "./processTigerFiles";
import { getInitCmdActionConfig, InitCmdActionConfig } from "./actionConfig";
import { FileReplacementSpec, replaceInFiles } from "./replaceInFiles";

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

/**
 * The original package.json can be tweaked now. The plugin name will be used for package name and
 * the dependency on unnecessary analytical backend impl will be dropped (bear backend dropped if tiger is
 * being used etc).
 *
 * @param target - target directory where the plugin template was expanded
 * @param config - config for the initialization action
 */
function modifyPackageJson(target: string, config: InitCmdActionConfig) {
    const { name, backend } = config;
    const packageJsonFile = path.resolve(target, "package.json");
    const packageJson = readJsonSync(packageJsonFile);
    const { peerDependencies, devDependencies } = packageJson;
    const unnecessaryBackendPkg = backend === "bear" ? TigerBackendPackage : BearBackendPackage;

    packageJson.name = name;
    delete peerDependencies[unnecessaryBackendPkg];
    delete devDependencies[unnecessaryBackendPkg];

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
    const { backend, hostname, workspace, dashboard, pluginIdentifier, language } = config;
    const isTiger = backend === "tiger";
    const replacements: FileReplacementSpec = {
        "webpack.config.js": [
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
                        regex: /"\.\.\/plugin"/g,
                        value: `"../${pluginIdentifier}"`,
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
 * @param config - config for the initialization action
 */
async function prepareProject(config: InitCmdActionConfig) {
    const { name, targetDir, language, backend } = config;
    const target = targetDir ? targetDir : path.resolve(process.cwd(), kebabCase(name));

    await unpackProject(target, language);
    modifyPackageJson(target, config);

    await processTigerFiles(target, backend === "tiger");
    renamePluginDirectories(target, config);
    await performReplacementsInFiles(target, config);
}

export async function initCmdAction(pluginName: string | undefined, options: ActionOptions): Promise<void> {
    try {
        const config = await getInitCmdActionConfig(pluginName, options);

        logInfo(`initCmdAction ${JSON.stringify(config, null, 4)}`);
        await prepareProject(config);
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);
            process.exit(1);
        } else {
            logError(`An error has occurred during initialization of new project: ${e.message}`);
        }
    }
}
