// (C) 2021 GoodData Corporation
import { ActionOptions, TargetAppFlavor, TargetBackendType } from "../_base/types";
import { logError, logInfo } from "../_base/cli/loggers";
import { promptBackend, promptFlavor, promptHostname, promptName } from "../_base/cli/prompts";
import kebabCase from "lodash/kebabCase";
import * as path from "path";
import mkdirp from "mkdirp";
import tar from "tar";
import { getDashboardPluginTemplateArchive } from "../dashboard-plugin-template";
import { readJsonSync, writeAsJsonSync } from "../_base/utils";
import {
    backendTypeValidator,
    flavorValidator,
    hostnameValidatorFactory,
    isInputValidationError,
    pluginNameValidator,
    validOrDie,
} from "../_base/cli/validators";

type InitCmdActionConfig = {
    backend: TargetBackendType;
    hostname: string;
    flavor: "ts" | "js";
    targetDir: string | undefined;
    skipInstall: boolean;
};

function getHostname(backend: TargetBackendType | undefined, options: ActionOptions): string | undefined {
    const { hostname } = options.programOpts;

    if (!hostname) {
        return undefined;
    }

    // do the hostname validation only if the backend type is known at this point
    if (backend !== undefined) {
        validOrDie("hostname", hostname, hostnameValidatorFactory(backend));
    }

    return hostname;
}

function getBackend(options: ActionOptions): TargetBackendType | undefined {
    const { backend } = options.commandOpts;

    if (!backend) {
        return undefined;
    }

    validOrDie("backend", backend, backendTypeValidator);

    return backend as TargetBackendType;
}

function getFlavor(options: ActionOptions): TargetAppFlavor | undefined {
    const { flavor } = options.commandOpts;

    if (!flavor) {
        return undefined;
    }

    validOrDie("flavor", flavor, flavorValidator);

    return flavor as TargetAppFlavor;
}

async function getPluginNameAndConfig(
    pluginName: string | undefined,
    options: ActionOptions,
): Promise<{ name: string; config: InitCmdActionConfig }> {
    if (pluginName) {
        validOrDie("plugin-name", pluginName, pluginNameValidator);
    }

    const backendFromOptions = getBackend(options);
    const hostnameFromOptions = getHostname(backendFromOptions, options);
    const flavorFromOptions = getFlavor(options);
    const backend = backendFromOptions ?? (await promptBackend());
    const hostname = hostnameFromOptions ?? (await promptHostname(backend));
    const flavor = flavorFromOptions ?? (await promptFlavor());
    const name = pluginName ?? (await promptName());

    // validate hostname once again; this is to catch the case when hostname is provided as
    // option but the backend is not and user is prompted for it. the user may select backend
    // for which the protocol used in the hostname is not valid (http on bear)
    validOrDie("hostname", hostname, hostnameValidatorFactory(backend));

    return {
        name: name,
        config: {
            backend,
            hostname,
            flavor,
            targetDir: options.commandOpts.targetDir,
            skipInstall: options.commandOpts.skipInstall ?? false,
        },
    };
}

//
//
//

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
    const target = config.targetDir ? config.targetDir : path.resolve(process.cwd(), kebabCase(name));

    await unpackProject(target, config.flavor);
    modifyPackageJson(target, name);
}

export async function initCmdAction(pluginName: string | undefined, options: ActionOptions): Promise<void> {
    try {
        const { name, config } = await getPluginNameAndConfig(pluginName, options);

        logInfo(`initCmdAction ${name} ${JSON.stringify(config, null, 4)}`);
        await prepareProject(name, config);
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);
            process.exit(1);
        }
    }
}
