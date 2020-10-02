// (C) 2020 GoodData Corporation
import { logError, logInfo } from "../cli/loggers";
import path from "path";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";
import { RushPackageDescriptor, SourceDescriptor, PackageDescriptor } from "./types";
import { createDependencyGraph } from "./dependencyGraph";
import { identity, keyBy } from "lodash";

/*
 * Singleton sdk package descriptor. Loaded the first time it is needed by `getSdkPackages`.
 */
let _SourceDescriptor: SourceDescriptor | undefined;

async function findRushJsonFile(): Promise<string | undefined> {
    return await findUp("rush.json", { cwd: process.cwd(), type: "file" });
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

    if (!rushJsonFile) {
        logError(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    } else {
        logInfo(`Found ${rushJsonFile}. Reading packages.`);
    }

    if (!_SourceDescriptor) {
        const rushPackages = readJsonSync(rushJsonFile).projects as RushPackageDescriptor[];
        const rootDir = path.dirname(rushJsonFile);
        const packages: PackageDescriptor[] = rushPackages
            .filter(predicate)
            .map((rushPackage: RushPackageDescriptor) => {
                const { packageName, projectFolder } = rushPackage;

                return {
                    packageName,
                    installDir: packageName.split("/"),
                    directory: path.join(rootDir, projectFolder),
                    rushPackage,
                };
            });

        logInfo(`Found ${packages.length} packages in rush.json`);

        _SourceDescriptor = {
            root: path.dirname(rushJsonFile),
            packages: keyBy(packages, (p) => p.packageName),
            packagesByDir: keyBy(packages, (p) => p.rushPackage.projectFolder),
            dependencyGraph: createDependencyGraph(packages),
        };
    }

    return _SourceDescriptor;
}
