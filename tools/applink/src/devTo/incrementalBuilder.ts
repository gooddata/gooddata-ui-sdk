// (C) 2020 GoodData Corporation
import { SdkDescriptor, SdkPackageDescriptor } from "../base/sdkPackages";
import { logError, logInfo, logWarn } from "../cli/loggers";
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
    private TimeoutId: any | undefined;
    private AccumulatedChanges: string[] = [];

    constructor(private readonly sdk: SdkDescriptor) {}

    private processRebuildRequests = (requests: RebuildRequest[]) => {
        requests.forEach((req) => {
            const { sdkPackage } = req;
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
            } else {
                logInfo(`[${sdkPackage.packageName}] Build succeeded after ${duration / 1000} seconds.`);
            }
        });
    };

    private rebuildAndPublish = () => {
        const changes = this.AccumulatedChanges.concat();
        this.AccumulatedChanges = [];

        const requests = createRebuildRequests(this.sdk, changes);

        if (requests.length === 0) {
            logWarn(
                `File change notifications processed but was not able to find any SDK packages to rebuild.`,
            );

            return;
        }

        logInfo(
            `Identified ${requests.length} package(s) to rebuild: ${requests
                .map((r) => r.sdkPackage.packageName)
                .join(", ")}`,
        );

        this.processRebuildRequests(requests);
    };

    public onSourceChange = (target: string, _type: "add" | "change" | "unlink"): void => {
        this.AccumulatedChanges.push(target);

        if (this.TimeoutId) {
            clearTimeout(this.TimeoutId);
        }

        this.TimeoutId = setTimeout(this.rebuildAndPublish, 500);
    };
}

function createRebuildRequests(sdk: SdkDescriptor, targets: string[]): RebuildRequest[] {
    const requests: Record<string, RebuildRequest> = {};

    targets.forEach((target) => {
        const request = createRebuildRequest(sdk, target);

        if (!request) {
            return;
        }

        const { packageName } = request.sdkPackage;
        const existingRequest = requests[packageName];

        if (!existingRequest) {
            requests[packageName] = request;
        } else {
            existingRequest.sourceFiles.push(...request.sourceFiles);
        }
    });

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
