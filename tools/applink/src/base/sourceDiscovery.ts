// (C) 2020-2021 GoodData Corporation
import path from "path";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";
import { PackageDescriptor, PackageJson, RushPackageDescriptor, SourceDescriptor } from "./types";
import { createDependencyGraph } from "./dependencyGraph";
import identity from "lodash/identity";
import keyBy from "lodash/keyBy";
import { PackageChange } from "../devConsole/events";
import values from "lodash/values";

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
    silent: boolean = false,
): Promise<SourceDescriptor | undefined> {
    const rushJsonFile = await findRushJsonFile();

    if (!rushJsonFile) {
        console.error(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    } else {
        !silent && console.info(`Found ${rushJsonFile}. Reading packages.`);
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

        !silent && console.info(`Found ${packages.length} packages in rush.json`);

        _SourceDescriptor = {
            root: path.dirname(rushJsonFile),
            packages: keyBy(packages, (p) => p.packageName),
            packagesByDir: keyBy(packages, (p) => p.rushPackage.projectFolder),
            dependencyGraph: createDependencyGraph(packages),
        };
    }

    return _SourceDescriptor;
}

/**
 * Given path to changed file (relative to the source repo root), find the source package to which the
 * file belongs.
 *
 * The files that come in are for instance 'tools/applink/src/index.ts':
 * -  The function assumes that the repo has projects organized in two levels
 * -  It will obtain project directory from the path -> 'tools/applink'
 * -  Try to match the package dir against information from the source descriptor
 * -  Create package change for the matched package + include paths to files - relative to the package directory
 */
export function identifyChangedPackages(
    sourceDescriptor: SourceDescriptor,
    files: string[],
    warn: (msg: string) => void = console.warn,
): PackageChange[] {
    const changeByPackage: Record<string, PackageChange> = {};

    files.forEach((file) => {
        // look for second separator -> that is where the package directory ends
        const libEndsIndex = file.indexOf(path.sep, file.indexOf(path.sep) + 1);

        if (libEndsIndex === -1) {
            warn(`Unable to find SDK lib to which ${file} belongs.`);
            return;
        }

        const packageDir = file.substr(0, libEndsIndex);
        const sdkPackage = sourceDescriptor.packagesByDir[packageDir];

        if (!sdkPackage) {
            warn(
                `Unable to find SDK lib to which ${file} belongs. Cannot match ${packageDir} to an SDK package.`,
            );

            return;
        }
        const { packageName } = sdkPackage;
        let packageChange = changeByPackage[packageName];

        if (!packageChange) {
            packageChange = {
                packageName,
                files: [],
            };

            changeByPackage[packageName] = packageChange;
        }

        packageChange.files.push(file.substr(libEndsIndex + 1));
    });

    return values(changeByPackage);
}
