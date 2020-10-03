// (C) 2020 GoodData Corporation
import {
    buildRequested,
    DcEvent,
    GlobalEventBus,
    IEventListener,
    BuildFinished,
    PackagesChanged,
    packagesRebuilt,
    buildScheduled,
} from "./events";
import { DependencyGraph, SourceDescriptor } from "../base/types";
import { findDependingPackages, naiveFilterDependencyGraph } from "../base/dependencyGraph";
import { flatten, uniq } from "lodash";
import { appLogError, appLogInfo, appLogWarn } from "./ui/utils";

type PackageState = {
    dirty: boolean;
    failed: boolean;
};

/**
 * Build scheduler is responsible for requesting builds of packages based on package change events.
 *
 * It achieves the goal thusly:
 *
 * 1.  Scheduler maintains state of each package currently in scope (determined by the target where the app publishes)
 * 2.  For each package it records whether it is dirty and/or whether it failed to build
 *     Dirty = the sources do not match dist. Rebuild is needed
 *     Failed = build has failed, exited with != 0
 * 3.  When packages change, scheduler will take those packages & all packages that depend on them and
 *     marks them as dirty
 * 4.  It then triggers builds of dirty leaf packages = those packages which are dirty but only depend on clean,
 *     successfully built packages (or have no dependencies at all). This way it can identify multiple packages
 *     which can be built in parallel
 * 5.  It then fires build requested events for each package
 * 6.  When the build finishes successfully, it marks the package as clean and looks for new dirty leaves
 *     to build
 *
 * There are couple of error cases in this process:
 *
 * -  Build is in progress and package change is registered. Scheduler will mark the build itself as dirty. Then
 *    when it finishes, it will not mark package as clean. When it looks for the dirty leaves again, it will find
 *    the package and run its build.
 *
 * -  Build fails - the package is marked as failed. For purposes of identifying dirty leaves, failed packages
 *    are not counted as clean dependencies.
 *
 */
export class BuildScheduler implements IEventListener {
    /*
     * set after handling sourceInitialized
     */
    private sourceDescriptor: SourceDescriptor | undefined;
    private dependencyGraph: DependencyGraph | undefined;

    private packageStates: Record<string, PackageState> = {};
    private dirtyBuilds: Set<string> = new Set<string>();
    private runningBuilds: Set<string> = new Set<string>();

    private buildsToGetClean: Set<string> = new Set<string>();

    constructor() {
        GlobalEventBus.register(this);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.sourceDescriptor = event.body.sourceDescriptor;

                break;
            }
            case "targetSelected": {
                // TODO once tool allows switching targets, it is essential that this changes. reconciliaton will
                //  be needed
                const packageScope = event.body.targetDescriptor.dependencies.map(
                    (dep) => dep.pkg.packageName,
                );

                this.dependencyGraph = naiveFilterDependencyGraph(
                    this.sourceDescriptor!.dependencyGraph,
                    packageScope,
                );
                packageScope.forEach(
                    (pkg) =>
                        (this.packageStates[pkg] = {
                            dirty: false,
                            failed: false,
                        }),
                );

                break;
            }
            case "packagesChanged": {
                this.processPackageChanges(event);
                this.triggerBuilds();

                break;
            }
            case "buildStarted": {
                this.runningBuilds.add(event.body.packageName);

                break;
            }
            case "buildFinished": {
                this.onBuildFinished(event);
                this.triggerBuilds();

                if (this.isAllClean()) {
                    /*
                     * After last build, when all packages are clean, emit PackagesRebuilt; this can then be
                     * used by publishers to copy results once everything is green.
                     */
                    packagesRebuilt(Array.from(this.buildsToGetClean.values()));
                    this.buildsToGetClean = new Set<string>();
                }

                break;
            }
        }
    };

    /*
     * When packages change, find all packages that transitively depend on them. Mark them as dirty so that when
     * triggerBuilds is called, it can identify the dirty leaves and rebuild.
     *
     * Also cater for race condition when during a build of a package there is a change to its source. In this case
     * it is uncertain whether the change will be picked up or not. Mark the running build of that package as
     * dirty.
     */
    private processPackageChanges = (packagesChanged: PackagesChanged): void => {
        const { changes } = packagesChanged.body;
        const changedPackages = changes.map((p) => p.packageName);
        const depending = findDependingPackages(this.dependencyGraph!, changedPackages, ["prod"]);
        const allPackagesToRebuild = changedPackages.concat(uniq(flatten(depending)));

        allPackagesToRebuild.forEach((pkg) => (this.packageStates[pkg].dirty = true));

        for (const packageToRebuild of allPackagesToRebuild) {
            if (this.runningBuilds.has(packageToRebuild)) {
                this.dirtyBuilds.add(packageToRebuild);
            }
        }

        GlobalEventBus.post(buildScheduled(changes, depending));
    };

    /*
     * Do bookkeeping after the build finishes:
     *
     * -  On success, clean failed indicator; if the build was not dirty, the package is clean
     * -  On fail, turn on failed indicator; if the build was not dirty, the package is clean. otherwise it
     *    stays dirty.
     *
     * Note that packages that stay dirty because of dirty build will be rebuild on next triggerBuilds().
     */
    private onBuildFinished = (event: BuildFinished): void => {
        const { exitCode, packageName } = event.body;
        const packageState = this.packageStates[packageName];

        if (exitCode) {
            packageState.dirty = this.dirtyBuilds.has(packageName);
            packageState.failed = true;

            appLogError(`Build of ${packageName} has failed.`);
        } else {
            packageState.dirty = this.dirtyBuilds.has(packageName);
            packageState.failed = false;

            if (!packageState.dirty) {
                this.buildsToGetClean.add(packageName);

                appLogInfo(`Build of ${packageName} has succeeded.`);
            } else {
                appLogWarn(
                    `Build of ${packageName} has succeeded however more changes to this package were register in the meanwhile. Have to rebuild.`,
                );
            }
        }

        this.dirtyBuilds.delete(packageName);
        this.runningBuilds.delete(packageName);
    };

    private triggerBuilds = (): void => {
        this.findDirtyLeaves().forEach((pkg) => {
            appLogInfo(`Going to rebuild ${pkg}.`);

            GlobalEventBus.post(buildRequested(pkg));
        });
    };

    /*
     * Find dirty leaves - those are packages which themselves are dirty but only depend
     * on packages that are clean and successfully built.
     *
     * This may find multiple packages = those can be naturally built in parallel.
     */
    private findDirtyLeaves = (): string[] => {
        const dirtyPackages: string[] = Object.entries(this.packageStates)
            .filter(([, state]) => state.dirty)
            .map(([packageName]) => packageName);

        if (!dirtyPackages.length) {
            return [];
        }

        const packagesWithCleanDeps = dirtyPackages.filter((pkg) => {
            return Object.values(this.dependencyGraph!.outgoing[pkg] ?? []).every((dependency) => {
                const dependencyState = this.packageStates[dependency.to];

                return !dependencyState.dirty && !dependencyState.failed;
            });
        });

        return packagesWithCleanDeps;
    };

    private isAllClean = (): boolean => {
        return Object.values(this.packageStates).every((s) => !s.dirty && !s.failed);
    };
}
