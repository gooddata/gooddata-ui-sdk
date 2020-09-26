// (C) 2020 GoodData Corporation
import { logError, logInfo } from "../cli/loggers";
import path from "path";
import keyBy from "lodash/keyBy";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";
import { RushPackageDescriptor, SdkDescriptor, SdkPackageDescriptor } from "./types";
import { createDependencyGraph } from "./sdkDependencyGraph";

/*
 * Singleton sdk package descriptor. Loaded the first time it is needed by `getSdkPackages`.
 */
let _SdkDescriptor: SdkDescriptor | undefined;

async function findRushJsonFile(): Promise<string | undefined> {
    return await findUp("rush.json", { cwd: process.cwd(), type: "file" });
}

/**
 * This function attempts to locate rush.json upwards from the cwd. Once found, it will parse the file, extract
 * SDK Package descriptors and construct SdkDescriptor.
 *
 * If the rush.json is not found, resolves to undefined. Otherwise returns the SDK Descriptor.
 */
export async function getSdkDescriptor(): Promise<SdkDescriptor | undefined> {
    const rushJsonFile = await findRushJsonFile();

    if (!rushJsonFile) {
        logError(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    } else {
        logInfo(`Found ${rushJsonFile}. Reading packages.`);
    }

    if (!_SdkDescriptor) {
        const rushPackages = readJsonSync(rushJsonFile).projects as RushPackageDescriptor[];
        const rootDir = path.dirname(rushJsonFile);
        const packages: SdkPackageDescriptor[] = rushPackages
            .filter((p) => !p.projectFolder.startsWith("examples") && !p.projectFolder.startsWith("skel"))
            .map((rushPackage: RushPackageDescriptor) => {
                const { packageName, projectFolder } = rushPackage;
                let isLib = true;

                if (rushPackage.projectFolder.startsWith("tools")) {
                    isLib = false;
                }

                return {
                    type: isLib ? "lib" : "tool",
                    packageName,
                    installDir: packageName.split("/"),
                    directory: path.join(rootDir, projectFolder),
                    rushPackage,
                };
            });

        logInfo(`Found ${packages.length} packages in rush.json`);

        _SdkDescriptor = {
            root: path.dirname(rushJsonFile),
            packages: keyBy(packages, (p) => p.packageName),
            packagesByDir: keyBy(packages, (p) => p.rushPackage.projectFolder),
            dependencyGraph: createDependencyGraph(packages),
        };
    }

    return _SdkDescriptor;
}
