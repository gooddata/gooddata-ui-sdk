// (C) 2020 GoodData Corporation

import * as path from "path";
import * as fs from "fs";
import { readJsonSync } from "../base/utils";
import { SdkDescriptor, SdkPackageDescriptor } from "../base/types";

/**
 * Describes application's dependency on an SDK library.
 */
export type DependencyOnSdk = {
    /**
     * Absolute path to the directory within app's node_modules where the SDK dependency is installed
     */
    directory: string;

    /**
     * The version of installed dependency.
     */
    version: string;

    /**
     * Full information about the SDK package on which the app depends.
     */
    pkg: SdkPackageDescriptor;
};

/**
 * Given app's root directory, this function finds all SDK packages on which the app depends. This is done
 * by looking for entry in node_modules.
 *
 * @param target - target app root directory
 * @param sdk - all known SDK packages
 */
export function findSdkDependencies(target: string, sdk: SdkDescriptor): DependencyOnSdk[] {
    const result: DependencyOnSdk[] = [];

    Object.values(sdk.packages).forEach((pkg) => {
        const directory = path.join(target, "node_modules", ...pkg.installDir);

        if (fs.existsSync(directory) && fs.statSync(directory).isDirectory()) {
            const packageJson = readJsonSync(path.join(directory, "package.json"));

            result.push({
                directory,
                version: packageJson.version,
                pkg,
            });
        }
    });

    return result;
}
