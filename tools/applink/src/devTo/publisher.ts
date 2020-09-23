// (C) 2020 GoodData Corporation

import { DependencyOnSdk } from "./dependencyDiscovery";
import { logError, logInfo, logSuccess, logWarn } from "../cli/loggers";
import path from "path";
import spawn from "cross-spawn";
import { SdkPackageDescriptor } from "../base/types";

export class DevBuildPublisher {
    private readonly packageToDep: Map<SdkPackageDescriptor, DependencyOnSdk> = new Map<
        SdkPackageDescriptor,
        DependencyOnSdk
    >();

    constructor(private readonly deps: DependencyOnSdk[]) {
        this.deps.forEach((dep) => {
            this.packageToDep.set(dep.pkg, dep);
        });
    }
    public onNewBuildsReady = (sdkPackages: SdkPackageDescriptor[]): void => {
        logInfo(
            `Going to publish content for ${sdkPackages.length} package(s): ${sdkPackages
                .map((p) => p.packageName)
                .join(", ")}`,
        );

        new Publisher(
            sdkPackages.map((pkg) => this.packageToDep.get(pkg)!),
            this.onPublished,
        ).run();
    };

    public onPublished = (success: DependencyOnSdk[], fail: DependencyOnSdk[]): void => {
        if (fail.length > 0) {
            if (success.length > 0) {
                logWarn(
                    `Published new builds for ${success.length} package(s): ${success
                        .map((d) => d.pkg.packageName)
                        .join(", ")}`,
                );
            }
            logError(
                `Failed publishing new builds for ${fail.length} package(s): ${fail
                    .map((d) => d.pkg.packageName)
                    .join(", ")}`,
            );
        } else {
            logSuccess(
                `Published new builds for ${success.length} package(s): ${success
                    .map((d) => d.pkg.packageName)
                    .join(", ")}`,
            );
        }
    };
}

const RsyncOptions = ["-rptgD", "--no-links", "--include=/*"];

type OnPublished = (deps: DependencyOnSdk[], failed: DependencyOnSdk[]) => void;

class Publisher {
    private finished: DependencyOnSdk[] = [];
    private failed: DependencyOnSdk[] = [];

    constructor(private readonly deps: DependencyOnSdk[], private readonly onPublished: OnPublished) {}

    private onCopyFinished = (dep: DependencyOnSdk, exitCode: number): void => {
        if (!exitCode) {
            // logInfo(`Successfully updated app with new build of ${dep.pkg.packageName}`);
            this.finished.push(dep);
        } else {
            // logError(`Failed to update app with new build of ${dep.pkg.packageName}`);
            this.failed.push(dep);
        }

        if (this.deps.length === this.finished.length + this.failed.length) {
            this.onPublished(this.finished, this.failed);
        }
    };

    public run = (): void => {
        for (const dep of this.deps) {
            const args = [path.join(dep.pkg.directory, "dist") + "/", path.join(dep.directory, "dist")];
            const rsync = spawn("rsync", [...RsyncOptions, ...args], {});

            rsync.on("close", (exitCode) => {
                this.onCopyFinished(dep, exitCode);
            });
            rsync.stderr?.on("data", (msg) => {
                logError(`Error while syncing ${dep.pkg.packageName}: ${msg}`);
            });
        }
    };
}
