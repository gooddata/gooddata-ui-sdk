// (C) 2020 GoodData Corporation
import { SourceDescriptor, PackageDescriptor } from "../base/types";
import { logError, logInfo, logNewSection, logWarn } from "../cli/loggers";
import { BuildRequest, PackageBuilder } from "./packageBuilder";

export class IncrementalBuilder {
    private timeoutId: any | undefined;
    private accumulatedChanges: string[] = [];

    constructor(
        private readonly sdk: SourceDescriptor,
        private readonly packageBuilder: PackageBuilder,
        private readonly onNewBuildsReady: (sdkPackages: PackageDescriptor[]) => void,
    ) {}

    private rebuildAndPublish = async () => {
        const changes = this.accumulatedChanges.concat();
        this.accumulatedChanges = [];

        const requests = createBuildRequestsForChangedPackages(this.sdk, changes);

        if (requests.length === 0) {
            logWarn(
                `File change notifications processed but was not able to find any SDK packages to rebuild.`,
            );

            return;
        }

        logNewSection();
        logInfo(
            `Identified ${requests.length} package(s) and their dependencies to rebuild: ${requests
                .map((r) => r.sdkPackage.packageName)
                .join(", ")}`,
        );

        const buildResult = await this.packageBuilder.buildWithDependencies(requests);

        if (!buildResult.every((r) => r.exitCode === 0)) {
            logError(
                "Not all packages were successfully built. Will not publish anything to the app. Fix errors and try again.",
            );
        } else {
            this.onNewBuildsReady(buildResult.map((r) => r.sdkPackage));
        }
    };

    public onSourceChange = (target: string, _type: "add" | "change" | "unlink"): void => {
        this.accumulatedChanges.push(target);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(this.rebuildAndPublish, 500);
    };
}

function createBuildRequestsForChangedPackages(sdk: SourceDescriptor, targets: string[]): BuildRequest[] {
    const requests: Record<string, BuildRequest> = {};

    for (const target of targets) {
        const request = createIncrementalBuildRequest(sdk, target);

        if (!request) {
            break;
        }

        const { packageName } = request.sdkPackage;
        const existingRequest = requests[packageName];

        if (!existingRequest) {
            requests[packageName] = request;
        } else {
            existingRequest.sourceFiles!.push(...request.sourceFiles!);
        }
    }

    return Object.values(requests);
}

function createIncrementalBuildRequest(sdk: SourceDescriptor, target: string): BuildRequest | undefined {
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
