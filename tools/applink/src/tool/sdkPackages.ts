// (C) 2020 GoodData Corporation
import { logError, logInfo } from "../cli/loggers";
import path from "path";
import keyBy from "lodash/keyBy";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";

let SdkPackages: Record<string, SdkPackage> | undefined;

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

export async function getSdkPackages(): Promise<Record<string, SdkPackage> | undefined> {
    const rushJsonFile = await findRushJsonFile();

    if (!rushJsonFile) {
        logError(
            "Unable to locate rush.json. You need to run this tool from inside the SDK directory hierarchy.",
        );

        return;
    } else {
        logInfo(`Found ${rushJsonFile}. Reading packages.`);
    }

    if (!SdkPackages) {
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

        SdkPackages = keyBy(packages, (p) => p.packageName);
        logInfo(`Found ${packages.length} packages in rush.json`);
    }

    return SdkPackages;
}
