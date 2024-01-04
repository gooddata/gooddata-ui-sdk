// (C) 2020-2021 GoodData Corporation
import {
    BuildFinished,
    buildRequested,
    buildScheduled,
    BuildStarted,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
    PackagesChanged,
    packagesRebuilt,
    TargetSelected,
} from "../events.js";
import { DependencyGraph, SourceDescriptor } from "../../base/types.js";
import { findDependingPackages, naiveFilterDependencyGraph } from "../../base/dependencyGraph.js";
import flatten from "lodash/flatten.js";
import uniq from "lodash/uniq.js";
import { appLogError, appLogWarn } from "../ui/utils.js";
import values from "lodash/values.js";

type PackageState = {
    buildRequested: boolean;
    buildRunning: boolean;
    buildDirty: boolean;
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
 * Note: the scheduler 'ticks' performs build-scheduling every time package change occurs or a build finishes. To
 * prevent triggering build of dirty packages multiple times, the scheduler needs to keep track of what package
 * builds were requested or are running.
 */
export class BuildScheduler implements IEventListener {
    /*
     * set after handling sourceInitialized
     */
    private sourceDescriptor: SourceDescriptor | undefined;
    /*
     * set after handling targetSelected
     */
    private dependencyGraph: DependencyGraph | undefined;
    /*
     * set after handling target selected. states maintained in packages changed, build started, build finished event handlers
     */
    private packageStates: Record<string, PackageState> = {};
    /*
     * contents are dispatched & then reset to empty once scheduler finds all packages are clean
     */
    private buildsToGetClean: Set<string> = new Set<string>();

    private constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): BuildScheduler {
        return new BuildScheduler(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.sourceDescriptor = event.body.sourceDescriptor;

                break;
            }
            case "targetSelected": {
                this.onTargetSelected(event);

                break;
            }
            case "packagesChanged": {
                this.onPackagesChanged(event);

                break;
            }
            case "buildStarted": {
                this.onBuildStarted(event);

                break;
            }
            case "buildFinished": {
                this.onBuildFinished(event);

                break;
            }
        }
    };

    //
    // Event handlers
    //

    /*
     * Initializes dependency graph and package states so that only those packages that are used in the target will
     * be effectively used by the scheduler.
     */
    private onTargetSelected = (event: TargetSelected): void => {
        // TODO once tool allows switching targets, it is essential that this changes. reconciliaton will
        //  be needed
        const packageScope = event.body.targetDescriptor.dependencies.map((dep) => dep.pkg.packageName);

        this.dependencyGraph = naiveFilterDependencyGraph(
            this.sourceDescriptor!.dependencyGraph,
            packageScope,
        );
        packageScope.forEach(
            (pkg) =>
                (this.packageStates[pkg] = {
                    buildDirty: false,
                    buildRequested: false,
                    buildRunning: false,
                    dirty: false,
                    failed: false,
                }),
        );
    };

    /*
     * When package change occurs, the scheduler determines all the impacted packages, marks them dirty and triggers
     * build of dirty leaves.
     */
    private onPackagesChanged = (event: PackagesChanged): void => {
        this.processPackageChanges(event);

        this.triggerBuilds();
    };

    /*
     * When build starts for a package, this handler will modify package state to indicate that the build is
     * running.
     */
    private onBuildStarted = (event: BuildStarted): void => {
        const packageState = this.packageStates[event.body.packageName];

        packageState.buildRequested = false;
        packageState.buildRunning = true;
    };

    private onBuildFinished = (event: BuildFinished): void => {
        this.processBuildFinished(event);
        this.triggerBuilds();

        if (this.isAllClean()) {
            /*
             * After last build, when all packages are clean, emit PackagesRebuilt; this can then be
             * used by publishers to copy results once everything is green.
             */
            this.eventBus.post(packagesRebuilt(Array.from(this.buildsToGetClean.values())));
            this.buildsToGetClean = new Set<string>();
        }
    };

    //
    //
    //

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
        const dependenciesToRebuild = changes.map((change) => {
            if (change.independent) {
                return [];
            } else {
                return findDependingPackages(this.dependencyGraph!, [change.packageName], ["prod"])[0];
            }
        });

        const allPackagesToRebuild = uniq(changedPackages.concat(flatten(dependenciesToRebuild)));

        allPackagesToRebuild.forEach((pkg) => (this.packageStates[pkg].dirty = true));

        for (const packageToRebuild of allPackagesToRebuild) {
            const packageState = this.packageStates[packageToRebuild];

            if (packageState.buildRunning) {
                packageState.buildDirty = true;
            }
        }

        this.eventBus.post(buildScheduled(changes, dependenciesToRebuild));
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
    private processBuildFinished = (event: BuildFinished): void => {
        const { exitCode, packageName } = event.body;
        const packageState = this.packageStates[packageName];

        if (exitCode) {
            packageState.dirty = packageState.buildDirty;
            packageState.failed = true;

            appLogError(`Build of ${packageName} has failed.`);
        } else {
            packageState.dirty = packageState.buildDirty;
            packageState.failed = false;

            if (!packageState.dirty) {
                this.buildsToGetClean.add(packageName);
            } else {
                appLogWarn(
                    `Build of ${packageName} has succeeded however more changes to this package were register in the meanwhile. Have to rebuild.`,
                );
            }
        }

        packageState.buildDirty = false;
        packageState.buildRunning = false;
    };

    private triggerBuilds = (): void => {
        this.findDirtyLeaves().forEach((pkg) => {
            const packageState = this.packageStates[pkg];

            packageState.buildRequested = true;
            packageState.buildRunning = false;
            packageState.buildDirty = false;

            this.eventBus.post(buildRequested(pkg));
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
            .filter(([, state]) => state.dirty && !state.buildRequested && !state.buildRunning)
            .map(([packageName]) => packageName);

        if (!dirtyPackages.length) {
            return [];
        }

        return dirtyPackages.filter((pkg) => {
            return values(this.dependencyGraph!.outgoing[pkg] ?? []).every((dependency) => {
                const dependencyState = this.packageStates[dependency.to];
                // packages with clean dependencies
                return !dependencyState.dirty && !dependencyState.failed;
            });
        });
    };

    private isAllClean = (): boolean => {
        return values(this.packageStates).every((s) => !s.dirty && !s.failed);
    };
}
