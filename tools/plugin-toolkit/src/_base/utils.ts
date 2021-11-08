// (C) 2021 GoodData Corporation
import * as fs from "fs";
import path from "path";
import snakeCase from "lodash/snakeCase";

export function toJsonString(obj: any): string {
    // note: using json-stable-stringify is likely not a good idea in this project:
    // the toolkit works with package.json files; stable stringify will reshuffle contents of package.json
    return JSON.stringify(obj, null, 4);
}

export function writeAsJsonSync(file: string, obj: object): void {
    fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

export function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
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
 * Converts plug name to an identifier that can be used for module federation identifier, directory names,
 * asset file names etc.
 *
 * @param name - plugin name as entered by the user
 */
export function convertToPluginIdentifier(name: string): string {
    return `dp_${snakeCase(name)}`;
}
