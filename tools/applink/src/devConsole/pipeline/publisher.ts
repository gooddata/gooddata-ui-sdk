// (C) 2020 GoodData Corporation

import { TargetDependency } from "../../base/types";
import path from "path";
import spawn from "cross-spawn";
import {
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
    PackagesRebuilt,
    publishFinished,
} from "../events";
import { appLogError } from "../ui/utils";

const RsyncOptions = ["-rptgD", "--no-links", "--include=/*"];

/**
 * Package publisher initializes itself as the target for publishing is selected. Then, once it receives PackagesRebuilt
 * event, it will use rsync to copy dist-to-dist from source to target.
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
        const args = [path.join(dep.pkg.directory, "esm") + "/", path.join(dep.directory, "esm")];
        const rsync = spawn("rsync", [...RsyncOptions, ...args], {});

        rsync.on("close", (exitCode) => {
            this.eventBus.post(publishFinished(dep.pkg.packageName, exitCode));
        });

        rsync.stderr?.on("data", (msg) => {
            appLogError(`Error while syncing ${dep.pkg.packageName}: ${msg}`);
        });
    };
}
