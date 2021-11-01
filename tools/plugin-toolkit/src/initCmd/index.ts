// (C) 2021 GoodData Corporation
import { ActionOptions, TargetAppFlavor, TargetBackendType } from "../_base/types";
import { logInfo } from "../_base/cli/loggers";
import { promptBackend, promptFlavor, promptHostname, promptName } from "../_base/cli/prompts";
import kebabCase from "lodash/kebabCase";
import * as path from "path";
import mkdirp from "mkdirp";
import tar from "tar";
import { getDashboardPluginTemplateArchive } from "../dashboard-plugin-template";
import { readJsonSync, writeAsJsonSync } from "../_base/utils";

type InitCmdActionConfig = {
    backend: TargetBackendType;
    hostname: string;
    flavor: "ts" | "js";
    targetDir: string;
    skipInstall: boolean;
};

function getHostname(options: ActionOptions): string | undefined {
    return options.programOpts.hostname;
}

function getBackend(options: ActionOptions): TargetBackendType | undefined {
    const { backend } = options.commandOpts;

    if (backend === "bear" || backend === "tiger") {
        return backend;
    }

    return undefined;
}

function getFlavor(options: ActionOptions): TargetAppFlavor | undefined {
    const { flavor } = options.commandOpts;

    if (flavor === "ts" || flavor === "js") {
        return flavor;
    }

    return undefined;
}

async function getEffectivePluginName(pluginName: string | undefined): Promise<string> {
    const name = pluginName ?? (await promptName());
    // TODO: add validation; don't want invalid characters that cannot be used for plugin/package name

    return kebabCase(name);
}

async function getEffectiveConfig(options: ActionOptions): Promise<InitCmdActionConfig> {
    const backend = getBackend(options) ?? (await promptBackend());
    const hostname = getHostname(options) ?? (await promptHostname(backend === "bear"));
    const flavor = getFlavor(options) ?? (await promptFlavor());

    return {
        backend,
        hostname,
        flavor,
        targetDir: options.commandOpts.targetDir,
        skipInstall: options.commandOpts.skipInstall ?? false,
    };
}

function unpackProject(target: string, flavor: TargetAppFlavor) {
    return mkdirp(target).then((_) => {
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

async function prepareProject(name: string, config: InitCmdActionConfig) {
    const target = path.resolve(config.targetDir, name);

    await unpackProject(target, config.flavor);
    modifyPackageJson(target, name);
}

export async function initCmdAction(pluginName: string | undefined, options: ActionOptions): Promise<void> {
    const config = await getEffectiveConfig(options);
    const name = await getEffectivePluginName(pluginName);

    logInfo(`initCmdAction ${name} ${JSON.stringify(config, null, 4)}`);
    await prepareProject(name, config);
}
