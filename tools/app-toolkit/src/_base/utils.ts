// (C) 2021-2022 GoodData Corporation
import path from "path";
import fse from "fs-extra";
import { isInputValidationError } from "./types.js";
import { logError } from "./terminal/loggers.js";
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
 * Converts application name to directory name for the application. This will ensure that if the application name
 * contains organization (`@something/application`) then only the `application` will be used.
 */
export function convertToApplicationDirectory(name: string): string {
    const split = name.split("/");

    return split.length > 1 ? split[1] : name;
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
