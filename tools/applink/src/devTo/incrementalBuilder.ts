// (C) 2020 GoodData Corporation
import { SdkDescriptor, SdkPackageDescriptor } from "../base/sdkPackages";
import { logError, logInfo, logNewSection, logWarn } from "../cli/loggers";
import fs from "fs";
import path from "path";
import spawn from "cross-spawn";

type RebuildRequest = {
    sdkPackage: SdkPackageDescriptor;
    sourceFiles: string[];
};

const StdoutFilename = "applink.log";
const StderrFilename = "applink.error.log";

export class IncrementalBuilder {
    private timeoutId: any | undefined;
    private accumulatedChanges: string[] = [];

    constructor(
        private readonly sdk: SdkDescriptor,
        private readonly onNewBuildsReady: (sdkPackages: SdkPackageDescriptor[]) => void,
    ) {}

    private processRebuildRequests = (requests: RebuildRequest[]) => {
        let allSucceeded = true;

        for (const request of requests) {
            const { sdkPackage } = request;
            const out = fs.openSync(path.join(sdkPackage.directory, StdoutFilename), "w+");
            const err = fs.openSync(path.join(sdkPackage.directory, StderrFilename), "w+");

            logInfo(`[${sdkPackage.packageName}] Starting incremental build.`);

            const startTime = Date.now();
            const result = spawn.sync("npm", ["run", "build-incremental"], {
                encoding: "utf-8",
                cwd: sdkPackage.directory,
                stdio: ["ignore", out, err],
            });
            const duration = Date.now() - startTime;

            if (result.status !== 0) {
                logError(
                    `[${sdkPackage.packageName}] Build failed after ${duration / 1000} seconds. See ${
                        sdkPackage.rushPackage.projectFolder
                    }/${StdoutFilename}.`,
                );

                allSucceeded = false;
            } else {
                logInfo(`[${sdkPackage.packageName}] Build succeeded after ${duration / 1000} seconds.`);
            }
        }

        if (allSucceeded) {
            this.onNewBuildsReady(requests.map((r) => r.sdkPackage));
        } else {
            logError(
                "Not all packages were successfully built. Will not publish anything to the app. Fix errors and try again.",
            );
        }
    };

    private rebuildAndPublish = () => {
        const changes = this.accumulatedChanges.concat();
        this.accumulatedChanges = [];

        const requests = createRebuildRequests(this.sdk, changes);

        if (requests.length === 0) {
            logWarn(
                `File change notifications processed but was not able to find any SDK packages to rebuild.`,
            );

            return;
        }

        logNewSection();
        logInfo(
            `Identified ${requests.length} package(s) to rebuild: ${requests
                .map((r) => r.sdkPackage.packageName)
                .join(", ")}`,
        );

        this.processRebuildRequests(requests);
    };

    public onSourceChange = (target: string, _type: "add" | "change" | "unlink"): void => {
        this.accumulatedChanges.push(target);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(this.rebuildAndPublish, 500);
    };
}

function createRebuildRequests(sdk: SdkDescriptor, targets: string[]): RebuildRequest[] {
    const requests: Record<string, RebuildRequest> = {};

    for (const target of targets) {
        const request = createRebuildRequest(sdk, target);

        if (!request) {
            break;
        }

        const { packageName } = request.sdkPackage;
        const existingRequest = requests[packageName];

        if (!existingRequest) {
            requests[packageName] = request;
        } else {
            existingRequest.sourceFiles.push(...request.sourceFiles);
        }
    }

    return Object.values(requests);
}

function createRebuildRequest(sdk: SdkDescriptor, target: string): RebuildRequest | undefined {
    const libEndsIndex = target.indexOf("/", target.indexOf("/") + 1);

    if (libEndsIndex === -1) {
        logWarn(`Unable to find SDK lib to which ${target} belongs.`);

        return undefined;
    }

    const libDir = target.substr(0, libEndsIndex);
    const sdkPackage = sdk.packagesByDir[libDir];

    if (!sdkPackage) {
        logWarn(
            `Unable to find SDK lib to which ${target} belongs. Cannot match ${libDir} to an SDK package.`,
        );

        return undefined;
    }

    return {
        sdkPackage,
        sourceFiles: [target.substr(libEndsIndex + 1)],
    };
}
