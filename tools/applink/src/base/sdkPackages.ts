// (C) 2020 GoodData Corporation
import { logError, logInfo } from "../cli/loggers";
import path from "path";
import keyBy from "lodash/keyBy";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";

let _Sdk: Sdk | undefined;

export type Sdk = {
    root: string;
    packages: Record<string, SdkPackage>;
    packagesByDir: Record<string, SdkPackage>;
};

export type SdkPackage = {
    type: "lib" | "tool";
    directory: string;
    packageName: string;
    packageDirs: string[];
    rushPackage: RushPackage;
};

export type RushPackage = {
    packageName: string;
    projectFolder: string;
    reviewCategory: string;
    versionPolicyName: string;
    shouldPublish: boolean;
};

async function findRushJsonFile(): Promise<string | undefined> {
    return await findUp("rush.json", { cwd: process.cwd(), type: "file" });
}

export async function getSdkPackages(): Promise<Sdk | undefined> {
    const rushJsonFile = await findRushJsonFile();

    if (!rushJsonFile) {
        logError(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    } else {
        logInfo(`Found ${rushJsonFile}. Reading packages.`);
    }

    if (!_Sdk) {
        const rushPackages = readJsonSync(rushJsonFile).projects as RushPackage[];
        const rootDir = path.dirname(rushJsonFile);
        const packages: SdkPackage[] = rushPackages
            .filter((p) => !p.projectFolder.startsWith("examples"))
            .map((rushPackage: RushPackage) => {
                const { packageName, projectFolder } = rushPackage;
                let isLib = true;

                if (rushPackage.projectFolder.startsWith("tools")) {
                    isLib = false;
                }

                return {
                    type: isLib ? "lib" : "tool",
                    packageName,
                    packageDirs: packageName.split("/"),
                    directory: path.join(rootDir, projectFolder),
                    rushPackage,
                };
            });

        logInfo(`Found ${packages.length} packages in rush.json`);

        _Sdk = {
            root: path.dirname(rushJsonFile),
            packages: keyBy(packages, (p) => p.packageName),
            packagesByDir: keyBy(packages, (p) => p.rushPackage.projectFolder),
        };
    }

    return _Sdk;
}
