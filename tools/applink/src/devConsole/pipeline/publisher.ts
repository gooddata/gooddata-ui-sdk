// (C) 2020-2022 GoodData Corporation

import { TargetDependency } from "../../base/types.js";
import path from "path";
import spawn from "cross-spawn";
import {
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
    PackagesRebuilt,
    publishFinished,
} from "../events.js";
import { appLogError, appLogInfo, appLogWarn } from "../ui/utils.js";
import max from "lodash/max.js";
import min from "lodash/min.js";
import uniq from "lodash/uniq.js";

const RsyncOptions = ["-rptgD", "--no-links", "--include=/*"];

/**
 * Package publisher initializes itself as the target for publishing is selected. Then, once it receives PackagesRebuilt
 * event, it will use rsync to copy files from source to target.
 *
 * To determine what to copy, the publisher with look at 'files' entry in package.json. Identify top-level dirs and
 * rsync them in entirety. This is not ideal - it would be safer to use entry in files as-is however i cannot be
 * bothered with fiddling with rsync arguments right now.
 */
export class PackagePublisher implements IEventListener {
    private dependencyIndex: Record<string, TargetDependency> = {};

    constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): PackagePublisher {
        return new PackagePublisher(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "targetSelected": {
                this.dependencyIndex = {};
                event.body.targetDescriptor.dependencies.forEach((dep) => {
                    this.dependencyIndex[dep.pkg.packageName] = dep;
                });

                break;
            }
            case "packagesRebuilt": {
                this.onPackagesRebuilt(event);

                break;
            }
        }
    };

    private onPackagesRebuilt = (event: PackagesRebuilt): void => {
        const { packages } = event.body;

        for (const packageName of packages) {
            const dep = this.dependencyIndex[packageName];

            this.copyBuild(dep);
        }
    };

    private copyBuild = (dep: TargetDependency): void => {
        const allTargetArgs = this.rsyncArguments(dep);

        if (!allTargetArgs) {
            appLogWarn(
                `There are no 'files' to sync for ${dep.pkg.packageName}. Assuming no publish needed. Skipping.`,
            );

            this.eventBus.post(publishFinished(dep.pkg.packageName, 0));

            return;
        }

        const latch = countdownLatch(allTargetArgs.length, (exitCodes) => {
            // see if there is any non-zero return code. either positive or negative number. if not assume success
            const exitCode = max(exitCodes) || min(exitCodes) || 0;

            this.eventBus.post(publishFinished(dep.pkg.packageName, exitCode));
        });

        allTargetArgs.forEach((args) => {
            const rsync = spawn("rsync", [...RsyncOptions, ...args], {});
            appLogInfo(`Syncing ${args[0]}`);
            rsync.on("close", (exitCode) => {
                // exitCode may be null if the rsync was interrupted by a signal; treat that as error
                latch(exitCode ?? 1);
            });

            rsync.stderr?.on("data", (msg) => {
                appLogError(`Error while syncing ${dep.pkg.packageName}: ${msg}`);
            });
        });
    };

    private rsyncArguments = (dep: TargetDependency): [string, string][] | undefined => {
        if (!dep.pkg.packageJson.files) {
            return;
        }

        const prefixes: string[] = [];

        dep.pkg.packageJson.files
            .filter((f) => f !== "NOTICE") // NOTICE is not a directory and we do not need to sync it anyway
            .forEach((fileEntry) => {
                prefixes.push(fileEntry.split("/")[0]);
            });

        return uniq(prefixes).map((dir) => [
            path.join(dep.pkg.directory, dir) + path.sep,
            path.join(dep.directory, dir),
        ]);
    };
}

function countdownLatch(max: number, fun: (exitCodes: number[]) => void): (exitCode: number) => void {
    let tickets = max;
    const exitCodes: number[] = [];

    return (exitCode: number): void => {
        tickets -= 1;
        exitCodes.push(exitCode);

        if (!tickets) {
            fun(exitCodes);
        }
    };
}
