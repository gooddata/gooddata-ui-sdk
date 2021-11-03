// (C) 2021 GoodData Corporation
import { ActionOptions, TargetAppFlavor } from "../_base/types";
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

//
//
//

function unpackProject(target: string, flavor: TargetAppFlavor) {
    return fse.mkdirp(target).then((_) => {
        return tar.x({
            file: getDashboardPluginTemplateArchive(flavor),
            strip: 1,
            cwd: target,
        });
    });
}

function modifyPackageJson(target: string, name: string) {
    const packageJsonFile = path.resolve(target, "package.json");
    const packageJson = readJsonSync(packageJsonFile);

    packageJson.name = name;
    writeAsJsonSync(packageJsonFile, packageJson);
}

async function prepareProject(config: InitCmdActionConfig) {
    const { name, targetDir, flavor, backend } = config;
    const target = targetDir ? targetDir : path.resolve(process.cwd(), kebabCase(name));

    await unpackProject(target, flavor);
    modifyPackageJson(target, name);

    await processTigerFiles(target, backend === "tiger");
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
        }
    }
}
