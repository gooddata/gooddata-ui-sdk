// (C) 2021-2022 GoodData Corporation
import path from "path";
import fse from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import { isInputValidationError, TargetBackendType } from "./types.js";
import { logError, logInfo } from "./terminal/loggers.js";
import { isNotAuthenticated } from "@gooddata/sdk-backend-spi";

export function toJsonString(obj: any): string {
    // note: using json-stable-stringify is likely not a good idea in this project:
    // the toolkit works with package.json files; stable stringify will reshuffle contents of package.json
    return JSON.stringify(obj, null, 4);
}

export function writeAsJsonSync(file: string, obj: object): void {
    fse.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fse.readFileSync(file, { encoding: "utf-8" }));
}

/**
 * Reads package.json file if it exists in current dir. Otherwise returns empty object.
 */
export function readPackageJsonIfExists(): Record<string, any> {
    if (fse.existsSync("package.json")) {
        return readJsonSync("package.json");
    }

    return {};
}

/**
 * Safely joins two path parts together.
 *
 * Path on windows will contain backslashes which can cause problems with Globby. This function makes sure
 * only forward slashes are used so that Globby and node fs works properly on all platforms.
 *
 * @param initialPath - the first part
 * @param relativePath - the second part
 * @returns joined path
 */
export function safeJoin(initialPath: string, relativePath: string): string {
    return path.posix.join(initialPath, relativePath).replace(/\\/g, "/");
}

/**
 * Converts plugin name to an identifier that can be used for module federation identifier, directory names,
 * asset file names etc.
 *
 * @param name - plugin name as entered by the user
 */
export function convertToPluginIdentifier(name: string): string {
    return `dp_${snakeCase(name)}`;
}

/**
 * Converts plugin name to directory name for the plugin. This will ensure that if the plugin name
 * contains organization (`@something/plugin`) then only the `plugin` will be used.
 */
export function convertToPluginDirectory(name: string): string {
    const split = name.split("/");

    return split.length > 1 ? split[1] : name;
}

/**
 * Converts plugin identifier to entry point file name
 */
export function convertToPluginEntrypoint(pluginIdentifier: string): string {
    return `${pluginIdentifier}.mjs`;
}

/**
 * Given package JSON contents, this function tries to discover the backend type that action should
 * target. The idea is: if the person develops plugin against particular backend then its likely
 * that they will also want to deploy it there.
 *
 * @param packageJson - package json object
 */
export function discoverBackendType(packageJson: Record<string, any>): TargetBackendType | undefined {
    const { peerDependencies = {} } = packageJson;

    if (peerDependencies["@gooddata/sdk-backend-bear"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-bear. Assuming backend type 'bear'.");

        return "bear";
    } else if (peerDependencies["@gooddata/sdk-backend-tiger"] !== undefined) {
        logInfo("Plugin project depends on @gooddata/sdk-backend-tiger. Assuming backend type 'tiger'.");

        return "tiger";
    }

    return undefined;
}

export function extractRootCause(error: any): any {
    if (error.cause === undefined || error.cause === null) {
        return error;
    }

    return extractRootCause(error.cause);
}

/**
 * This function will attempt to categorize the provided error and print something meaningful into the console.
 *
 * @param error - error message to report on
 */
export function genericErrorReporter(error: any): void {
    if (isInputValidationError(error)) {
        logError(error.message);
    } else if (isNotAuthenticated(error)) {
        logError(
            "Authentication to backend has failed. Please ensure your environment is setup with correct credentials.",
        );
    } else {
        const e = extractRootCause(error);

        if (e.message?.search(/.*(certificate|self-signed).*/) > -1) {
            logError(
                "Server does not have valid certificate. The login has failed. " +
                    "If you trust the server, you can use the --accept-untrusted-ssl option " +
                    "to turn off certificate validation.",
            );
        } else {
            logError(`An unexpected error has occurred: ${e.stack}`);
        }
    }
}
