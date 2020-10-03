// (C) 2020 GoodData Corporation
import fs from "fs";
import path from "path";
import { logError, logInfo, logSuccess } from "../cli/loggers";
import spawn from "cross-spawn";
import { SourceDescriptor, PackageDescriptor } from "../base/types";
import { determinePackageBuildOrder, findDependingPackages } from "../base/dependencyGraph";
import { TargetDependency } from "../base/types";

/**
 * Request to build a particular SDK package
 */
export type BuildRequest = {
    /**
     * Package to build
     */
    sdkPackage: PackageDescriptor;

    /**
     * Files that changed, which triggered the build request.
     */
    sourceFiles?: string[];
};

/**
 * Build result for an SDK package.
 */
export type BuildResult = {
    /**
     * Package that was built
     */
    sdkPackage: PackageDescriptor;

    /**
     * Exit code of the incremental build
     */
    exitCode: number | null;

    /**
     * Absolute path to file where stdout from the build is stored
     */
    stdoutPath: string;

    /**
     * Absolute path to file where stderr from the build is stored
     */
    stderrPath: string;

    /**
     * Build duration.
     */
    duration: number;
};

const StdoutFilename = "applink.log";
const StderrFilename = "applink.error.log";

type BuildResolver = (result: BuildResult[]) => void;
type BuildReject = (err: Error) => void;

type Build = {
    queue: BuildRequest[][];
    results: BuildResult[];
    resolve: BuildResolver;
    reject: BuildReject;
};

/**
 * Package builder is responsible for orchestration of build of SDK packages in correct order, respecting dependencies
 * and running builds in parallel if possible.
 *
 * To that end, the builder works with a build order which it obtains by inspecting SDK dependency graph. Note that
 * the code obtains the build order for all the packages, and then it applies additional filtering based on the
 * dependencies which are actually used in the app against which the `devTo` runs.
 *
 * This simple filtering leads to correct build order if one assumption holds: the target app's node_modules are correct.
 * Correctly node_modules in the target app will contain a subtree(s) from some node(s) all the way down to the leaves with
 * all the necessary dependencies.
 */
export class PackageBuilder {
    private readonly buildOrder: string[][];
    private currentBuild: Build | undefined;
    private pendingBuilds: Build[] = [];

    constructor(readonly sdk: SourceDescriptor, deps: TargetDependency[]) {
        this.buildOrder = filterBuildOrderToCurrentScope(
            determinePackageBuildOrder(sdk.dependencyGraph),
            deps,
        );
    }

    private onParallelBuildFinished = (finished: BuildResult[], failed: BuildResult[]) => {
        if (!this.currentBuild) {
            return;
        }

        this.currentBuild.results.push(...finished, ...failed);
        this.processBuild();
    };

    private processBuild = (): void => {
        if (!this.currentBuild) {
            return;
        }

        if (!this.currentBuild.queue.length) {
            this.currentBuild.resolve(this.currentBuild.results);
            this.currentBuild = undefined;

            this.startPendingBuild();
            return;
        }

        const requests = this.currentBuild.queue.pop()!;

        new ParallelBuilder(requests, this.onParallelBuildFinished).run();
    };

    private startPendingBuild = (): void => {
        if (!this.pendingBuilds.length) {
            return;
        }

        if (this.currentBuild) {
            return;
        }

        this.currentBuild = this.pendingBuilds.pop()!;
        this.processBuild();
    };

    private addPendingBuild = (build: Build): void => {
        this.pendingBuilds.push(build);

        this.startPendingBuild();
    };

    public buildAll = (): Promise<BuildResult[]> => {
        let resolve: BuildResolver | undefined = undefined;
        let reject: BuildReject | undefined = undefined;

        const promise = new Promise<BuildResult[]>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        const build: Build = {
            queue: [],
            resolve: resolve!,
            reject: reject!,
            results: [],
        };

        for (const group of this.buildOrder) {
            const groupRequests: BuildRequest[] = group.map((g) => ({
                sdkPackage: this.sdk.packages[g]!,
            }));

            build.queue.push(groupRequests);
        }

        build.queue.reverse();
        this.addPendingBuild(build);

        return promise;
    };

    public buildWithDependencies = (requests: BuildRequest[]): Promise<BuildResult[]> => {
        let resolve: BuildResolver | undefined = undefined;
        let reject: BuildReject | undefined = undefined;

        const promise = new Promise<BuildResult[]>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        const build: Build = {
            queue: expandBuildRequestsToIncludeDependencies(this.sdk, this.buildOrder, requests),
            resolve: resolve!,
            reject: reject!,
            results: [],
        };

        this.addPendingBuild(build);

        return promise;
    };
}

type OnParallelBuildFinished = (finished: BuildResult[], failed: BuildResult[]) => void;

class ParallelBuilder {
    private finished: BuildResult[] = [];
    private failed: BuildResult[] = [];

    constructor(
        private readonly requests: BuildRequest[],
        private readonly onPackageGroupBuilt: OnParallelBuildFinished,
    ) {}

    private onBuildFinished = (result: BuildResult): void => {
        if (!result.exitCode) {
            logSuccess(`[${result.sdkPackage.packageName}] Build succeeded in ${result.duration / 1000}s`);

            this.finished.push(result);
        } else {
            logError(
                `[${result.sdkPackage.packageName}] Build failed in ${result.duration / 1000}s. See: ${
                    result.stdoutPath
                }`,
            );

            this.failed.push(result);
        }

        if (this.requests.length === this.finished.length + this.failed.length) {
            this.onPackageGroupBuilt(this.finished, this.failed);
        }
    };

    public run = (): void => {
        for (const request of this.requests) {
            const { sdkPackage } = request;
            const stdoutPath = path.join(sdkPackage.directory, StdoutFilename);
            const stderrPath = path.join(sdkPackage.directory, StderrFilename);
            const stdout = fs.openSync(stdoutPath, "w+");
            const stderr = fs.openSync(stderrPath, "w+");

            logInfo(`[${sdkPackage.packageName}] Starting incremental build.`);

            const startTime = Date.now();
            const build = spawn("npm", ["run", "build-incremental"], {
                cwd: sdkPackage.directory,
                stdio: ["ignore", stdout, stderr],
            });

            build.on("close", (exitCode) => {
                const duration = Date.now() - startTime;

                this.onBuildFinished({
                    exitCode,
                    sdkPackage,
                    stdoutPath,
                    stderrPath,
                    duration,
                });
            });
        }
    };
}

function filterBuildOrderToCurrentScope(buildOrder: string[][], deps: TargetDependency[]): string[][] {
    const packagesInScope: Set<string> = new Set<string>();

    deps.forEach((dep) => packagesInScope.add(dep.pkg.packageName));

    return buildOrder
        .map((group) => group.filter((pkg) => packagesInScope.has(pkg)))
        .filter((g) => g.length > 0);
}

/**
 * Given the original build requests, this function takes sdk dependency graph and the build order and constructs
 * groups of build requests to process. Requests in each group are independent and can be built in parallel. The groups
 * should be processed sequentally from left to right.
 *
 * @param sdk - sdk, for the dependency graph
 * @param buildOrder - the full build order containing all packages
 * @param originalRequests - original requests provided to expand
 */
function expandBuildRequestsToIncludeDependencies(
    sdk: SourceDescriptor,
    buildOrder: string[][],
    originalRequests: BuildRequest[],
): BuildRequest[][] {
    const dependingPackages = findDependingPackages(
        sdk.dependencyGraph,
        originalRequests.map((r) => r.sdkPackage),
    );
    const packagesInScope: Set<string> = new Set<string>();

    originalRequests.forEach((r) => packagesInScope.add(r.sdkPackage.packageName));
    dependingPackages.forEach((group) => group.forEach((pkg) => packagesInScope.add(pkg)));

    const filteredBuildOrder = buildOrder
        .map((group) => group.filter((pkg) => packagesInScope.has(pkg)))
        .filter((g) => g.length > 0);

    filteredBuildOrder.reverse();

    return filteredBuildOrder.map((group) => group.map((pkg) => ({ sdkPackage: sdk.packages[pkg]! })));
}

/**
 * Given build results, filter out those that describe errors.
 *
 * @param results - build results
 */
export function filterBuildErrors(results: BuildResult[]): BuildResult[] {
    return results.filter((r) => r.exitCode !== 0);
}
