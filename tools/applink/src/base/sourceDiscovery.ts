// (C) 2020-2025 GoodData Corporation

import path from "path";
import process from "process";

import findUp from "find-up";
import { keyBy } from "lodash-es";

import { createDependencyGraph } from "./dependencyGraph.js";
import {
    type PackageDescriptor,
    type PackageJson,
    type RushPackageDescriptor,
    type SourceDescriptor,
} from "./types.js";
import { readJsonSync } from "./utils.js";

const identity = <T>(v: T): boolean => !!v;

/*
 * Singleton sdk package descriptor. Loaded the first time it is needed by `getSdkPackages`.
 */
let _SourceDescriptor: SourceDescriptor | undefined;

async function findRushJsonFile(): Promise<string | undefined> {
    return findUp("rush.json", { cwd: process.cwd(), type: "file" });
}

export type RushPackagePredicate = (rushPackage: RushPackageDescriptor) => boolean;

/**
 * This function attempts to locate rush.json upwards from the cwd. Once found, it will parse the file, extract
 * SDK Package descriptors and construct SdkDescriptor.
 *
 * If the rush.json is not found, resolves to undefined. Otherwise returns the SDK Descriptor.
 */
export async function getSourceDescriptor(
    predicate: RushPackagePredicate = identity,
): Promise<SourceDescriptor | undefined> {
    const rushJsonFile = await findRushJsonFile();

    if (rushJsonFile) {
        console.info(`Found ${rushJsonFile}. Reading packages.`);
    } else {
        console.error(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    }

    if (!_SourceDescriptor) {
        const rushPackages = readJsonSync(rushJsonFile).projects as RushPackageDescriptor[];
        const rootDir = path.dirname(rushJsonFile);
        const packages: PackageDescriptor[] = rushPackages
            .filter(predicate)
            .map((rushPackage: RushPackageDescriptor) => {
                const { packageName, projectFolder } = rushPackage;
                const directory = path.join(rootDir, projectFolder);
                return {
                    packageName,
                    packageJson: readJsonSync(path.join(directory, "package.json")) as PackageJson,
                    installDir: packageName.split("/"),
                    directory,
                    rushPackage,
                };
            });

        console.info(`Found ${packages.length} packages in rush.json`);

        _SourceDescriptor = {
            root: path.dirname(rushJsonFile),
            packages: keyBy(packages, (p) => p.packageName),
            packagesByDir: keyBy(packages, (p) => p.rushPackage.projectFolder),
            dependencyGraph: createDependencyGraph(packages),
        };
    }

    return _SourceDescriptor;
}
