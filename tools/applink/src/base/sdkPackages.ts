// (C) 2020 GoodData Corporation
import { logError, logInfo } from "../cli/loggers";
import path from "path";
import keyBy from "lodash/keyBy";
import findUp from "find-up";
import process from "process";
import { readJsonSync } from "./utils";

/*
 * Singleton sdk package descriptor. Loaded the first time it is needed by `getSdkPackages`.
 */
let _SdkDescriptor: SdkDescriptor | undefined;

/**
 * SDK descriptor
 */
export type SdkDescriptor = {
    /**
     * Absolute path to the root directory where SDK is located.
     */
    root: string;

    /**
     * Mapping of package name to SDK Package
     */
    packages: Record<string, SdkPackageDescriptor>;

    /**
     * Mapping of package dir (relative to SDK root) to SDK Package.
     */
    packagesByDir: Record<string, SdkPackageDescriptor>;
};

/**
 * SDK Package descriptor
 */
export type SdkPackageDescriptor = {
    /**
     * Type of package (library or tool)
     */
    type: "lib" | "tool";

    /**
     * Package name (@gooddata/api-client-bear)
     */
    packageName: string;

    /**
     * Absolute path to the package directory.
     */
    directory: string;

    /**
     * Package's installation directory, split to segments (['@gooddata', 'api-client-bear']
     */
    installDir: string[];

    /**
     * Package metadata from `rush.json`.
     */
    rushPackage: RushPackageDescriptor;
};

/**
 * Rush package metadata
 */
export type RushPackageDescriptor = {
    /**
     * Package name
     */
    packageName: string;

    /**
     * Relative path to the package folder (libs/api-client-bear)
     */
    projectFolder: string;

    /**
     * 3rd party dependency review category
     */
    reviewCategory: string;

    /**
     * Versioning policy name
     */
    versionPolicyName: string;

    /**
     * Indicates whether package should be published.
     */
    shouldPublish: boolean;
};

async function findRushJsonFile(): Promise<string | undefined> {
    return await findUp("rush.json", { cwd: process.cwd(), type: "file" });
}

/**
 * This function attempts to locate rush.json upwards from the cwd. Once found, it will parse the file, extract
 * SDK Package descriptors and construct SdkDescriptor.
 *
 * If the rush.json is not found, resolves to undefined. Otherwise returns the SDK Descriptor.
 */
export async function getSdkPackages(): Promise<SdkDescriptor | undefined> {
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
            .filter((p) => !p.projectFolder.startsWith("examples"))
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
        };
    }

    return _SdkDescriptor;
}
