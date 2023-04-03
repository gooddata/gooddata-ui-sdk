// (C) 2021-2022 GoodData Corporation
import { ActionOptions, AppTemplate, TargetAppLanguage } from "../_base/types";
import { logError, logInfo, logSuccess, logWarn } from "../_base/terminal/loggers";
import * as path from "path";
import fse from "fs-extra";
import tar from "tar";
import { getReactAppTemplateArchive } from "../react-app-template";
import {
    convertToApplicationDirectory,
    genericErrorReporter,
    readJsonSync,
    writeAsJsonSync,
} from "../_base/utils";
import { getInitCmdActionConfig, InitCmdActionConfig } from "./actionConfig";
import { FileReplacementSpec, replaceInFiles } from "./replaceInFiles";
import { sync as spawnSync } from "cross-spawn";

const archiveNameFunctionByTemplate: { [template in AppTemplate]: (language: TargetAppLanguage) => string } =
    {
        "react-app": getReactAppTemplateArchive,
    };

function unpackProject(target: string, language: TargetAppLanguage, template: AppTemplate) {
    const archiveNameFunction = archiveNameFunctionByTemplate[template];

    return fse.mkdirp(target).then((_) => {
        return tar.x({
            file: archiveNameFunction(language),
            strip: 1,
            cwd: target,
        });
    });
}

/**
 * The original package.json can be tweaked now. The application name will be used for package name.
 *
 * @param target - target directory where the application template was expanded
 * @param config - config for the initialization action
 */
function modifyPackageJson(target: string, config: InitCmdActionConfig) {
    const { name } = config;
    const packageJsonFile = path.resolve(target, "package.json");
    const packageJson = readJsonSync(packageJsonFile);
    packageJson.name = name;

    writeAsJsonSync(packageJsonFile, packageJson);
}

function performReplacementsInFiles(dir: string, config: InitCmdActionConfig): Promise<void> {
    const { language, packageManager } = config;

    const replacements: FileReplacementSpec = {
        "README.md": [
            {
                regex: /\{\{packageManager\}\}/g,
                value: packageManager,
            },
            {
                regex: /\{\{language\}\}/g,
                value: language,
            },
        ],
    };

    return replaceInFiles(dir, replacements);
}

/**
 * Prepares a new project for the application, according to the configuration obtained from CLI and/or by
 * prompting the user.
 *
 * The responsibility of this function is to create target directory, unpack the contents of the
 * appropriate application template archive and then 'massage' the unpacked files and directories:
 *
 * -  package json has to be modified
 * -  string replacements need to happen in the different files to reflect the renaming
 *
 * @param target - target directory to create application in
 * @param config - config for the initialization action
 */
async function prepareProject(target: string, config: InitCmdActionConfig): Promise<void> {
    const { language, template } = config;

    await unpackProject(target, language, template);
    modifyPackageJson(target, config);

    await performReplacementsInFiles(target, config);
}

function runInstall(target: string, config: InitCmdActionConfig): void {
    const { skipInstall, packageManager } = config;
    const isNpm = packageManager === "npm";

    if (skipInstall) {
        logWarn(
            `Skipping installation of application project dependencies. Make sure to run '${packageManager} install' in the application directory before you start developing.`,
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
    } catch (e: any) {
        logError(
            `An internal error has occurred while attempting to install project dependencies: ${e.message}`,
        );

        return;
    }
}

export async function initCmdAction(
    applicationName: string | undefined,
    options: ActionOptions,
): Promise<void> {
    try {
        const config = await getInitCmdActionConfig(applicationName, options);
        const { name, targetDir } = config;
        const target = targetDir
            ? targetDir
            : path.resolve(process.cwd(), convertToApplicationDirectory(name));

        if (fse.existsSync(target)) {
            logError(
                `Directory for your new application already exists: ${target}. Either use a different application name or use --target-dir and specify a different directory.`,
            );

            process.exit(1);
        }

        await prepareProject(target, config);

        runInstall(target, config);

        logSuccess(
            `A new project for your application is ready in: ${target}. Check out the package.json and fill in author and description if possible.`,
        );
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
