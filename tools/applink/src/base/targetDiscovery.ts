// (C) 2020-2025 GoodData Corporation

import * as fs from "fs";
import * as path from "path";

import {
    type PackageJson,
    type SourceDescriptor,
    type TargetDependency,
    type TargetDescriptor,
} from "../base/types.js";
import { readJsonSync } from "../base/utils.js";

/**
 * Given app's root directory, this function finds all source packages on which the app depends. This is done
 * by looking for entry in node_modules.
 *
 * @param target - target app root directory
 * @param sourceDescriptor - source descriptor to match dependencies against
 */
export function getTargetDescriptor(target: string, sourceDescriptor: SourceDescriptor): TargetDescriptor {
    const root = path.resolve(target);
    const dependencies: TargetDependency[] = [];

    Object.values(sourceDescriptor.packages).forEach((pkg) => {
        const directory = path.join(root, "node_modules", ...pkg.installDir);

        if (fs.existsSync(directory) && fs.statSync(directory).isDirectory()) {
            const installedPackageJson = readJsonSync(path.join(directory, "package.json")) as PackageJson;

            dependencies.push({
                directory,
                packageJson: installedPackageJson,
                version: installedPackageJson.version,
                pkg,
            });
        }
    });

    return {
        root,
        dependencies,
    };
}
