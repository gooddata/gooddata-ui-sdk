// (C) 2020-2026 GoodData Corporation

import path from "path";

import { intersection } from "lodash-es";
import Watchpack from "watchpack";

import { type PackageDescriptor, type SourceDescriptor, type TargetDescriptor } from "../../base/types.js";
import {
    type DcEvent,
    type EventBus,
    GlobalEventBus,
    type IAutobuildToggled,
    type IEventListener,
    type PackageChange,
    packagesChanged,
} from "../events.js";
import { appLogImportant, appLogWarn } from "../ui/utils.js";

/**
 * Change detector will wait until it has both source & target descriptors. After that it will determine
 * what source directories to watch. It will accumulate file change records and periodically determine which
 * packages they belong to, and then fire PackagesChanged event.
 *
 * The change detector supports target switching. If it receives TargetSelected again, it will re-initialize.
 *
 * Note: upon reinit it keeps the accumulated file changes on purpose. These will be processed and dispatched
 * normally.
 */
export class ChangeDetector implements IEventListener {
    /*
     * set after handling sourceInitialized
     */
    private sourceDescriptor: SourceDescriptor | undefined;

    /*
     * set after handling targetInitialized
     */
    private targetDescriptor: TargetDescriptor | undefined;

    /*
     * set after targetInitialized
     */
    private watcher: Watchpack | undefined;

    private timeoutId: any;
    private accumulatedFileChanges: string[] = [];
    private active: boolean = true;

    private constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): ChangeDetector {
        return new ChangeDetector(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.sourceDescriptor = event.body.sourceDescriptor;

                break;
            }
            case "targetSelected": {
                this.targetDescriptor = event.body.targetDescriptor;

                // close previous instance which may be monitoring completely different set of dirs
                this.close();
                // then start new instance of watchpack for just the selected target packages
                this.startWatchingForChanges();

                break;
            }
            case "autobuildToggled": {
                this.onAutobuildToggled(event);
                break;
            }
        }
    };

    private onAutobuildToggled = (event: IAutobuildToggled): void => {
        const { value } = event.body;

        this.active = value;

        if (this.active) {
            this.resumeChanges();
        } else {
            this.pauseChanges();
        }
    };

    private pauseChanges = (): void => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }

        appLogWarn("Autobuild paused. Will accumulate file change information but will not start builds.");
    };

    private resumeChanges = (): void => {
        this.processAccumulatedChanges();

        appLogImportant("Autobuild resumed. Will dispatch all accumulated changes.");
    };

    private close = (): void => {
        if (this.watcher) {
            this.watcher.close();
        }
    };

    private onSourceChanged = (target: string): void => {
        this.accumulatedFileChanges.push(target);

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (this.active) {
            this.timeoutId = setTimeout(this.processAccumulatedChanges, 100);
        }
    };

    private startWatchingForChanges = (): void => {
        const packages = Object.values(this.sourceDescriptor!.packages);
        const targetDependsOn = this.targetDescriptor!.dependencies.map((dep) => dep.pkg);
        const scope = intersection(packages, targetDependsOn);

        const watchDirs = createWatchDirs(scope);
        const absoluteWatchDirs = watchDirs.map((dir) => path.resolve(this.sourceDescriptor!.root, dir));

        this.watcher = new Watchpack({
            aggregateTimeout: 100,
            poll: false,
            followSymlinks: false,
            ignored: /node_modules/,
        });

        this.watcher.on("change", (filePath: string) => {
            // Convert absolute path back to relative path
            const relativePath = path.relative(this.sourceDescriptor!.root, filePath);
            this.onSourceChanged(relativePath);
        });

        this.watcher.on("aggregated", (changes: Set<string>) => {
            // Handle aggregated changes if needed
            for (const filePath of changes) {
                const relativePath = path.relative(this.sourceDescriptor!.root, filePath);
                this.onSourceChanged(relativePath);
            }
        });

        this.watcher.watch({
            files: [],
            directories: absoluteWatchDirs,
            missing: [],
            startTime: Date.now(),
        });

        appLogImportant("Package change detector started.");
    };

    /**
     * Given path to changed file (relative to the source repo root), find the source package to which the
     * file belongs.
     *
     * The files that come in are for instance 'tools/applink/src/index.ts':
     * -  The function assumes that the repo has projects organized in two levels
     * -  It will obtain project directory from the path → 'tools/applink'
     * -  Try to match the package dir against information from the source descriptor
     * -  Create package change for the matched package + include paths to files - relative to the package directory
     */
    private identifyChangedPackage = (file: string): PackageChange | undefined => {
        // look for second separator -> that is where the package directory ends
        const libEndsIndex = file.indexOf(path.sep, file.indexOf(path.sep) + 1);

        if (libEndsIndex === -1) {
            appLogWarn(`Unable to find SDK lib to which ${file} belongs.`);

            return undefined;
        }

        const packageDir = file.substr(0, libEndsIndex);
        const sdkPackage = this.sourceDescriptor!.packagesByDir[packageDir];

        if (!sdkPackage) {
            appLogWarn(
                `Unable to find SDK lib to which ${file} belongs. Cannot match ${packageDir} to an SDK package.`,
            );

            return undefined;
        }

        return {
            packageName: sdkPackage.packageName,
            files: [file.substr(libEndsIndex + 1)],
        };
    };

    private processAccumulatedChanges = (): void => {
        const changes: Record<string, PackageChange> = {};
        const fileChanges = this.accumulatedFileChanges;
        this.accumulatedFileChanges = [];

        for (const file of fileChanges) {
            const change = this.identifyChangedPackage(file);

            if (!change) {
                break;
            }

            const { packageName } = change;
            const existingRequest = changes[packageName];

            if (existingRequest) {
                existingRequest.files.push(...change.files);
            } else {
                changes[packageName] = change;
            }
        }

        for (const changeId in changes) {
            const change = changes[changeId];
            // Omit __version files generated during the build, otherwise build ends up in endless cycle
            changes[changeId].files = change.files.filter(
                (file) => !file.includes("__version.ts") && !file.endsWith(".localization-bundle.ts"),
            );
            if (changes[changeId].files.length === 0) {
                delete changes[changeId];
            }
        }

        this.eventBus.post(packagesChanged(Object.values(changes)));
    };
}

function createWatchDirs(packages: PackageDescriptor[]): string[] {
    return packages.map((pkg) => {
        return path.join(pkg.directory, "src");
    });
}
