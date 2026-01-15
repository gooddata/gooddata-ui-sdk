// (C) 2020-2026 GoodData Corporation

import fs from "fs";
import path from "path";

import spawn from "cross-spawn";
import { intersection, isEmpty } from "lodash-es";

import { type PackageDescriptor, type SourceDescriptor } from "../../base/types.js";
import {
    type DcEvent,
    type EventBus,
    GlobalEventBus,
    type IBuildRequested,
    type IEventListener,
    type ISourceInitialized,
    buildFinished,
    buildStarted,
} from "../events.js";
import { appLogInfo, appLogWarn } from "../ui/utils.js";

const StdoutFilename = "applink.log";
const StderrFilename = "applink.error.log";

const BuildScriptPreference = ["build"];

/**
 * Package builder initialized itself after SourceInitialized event. And then as BuildRequested events appear,
 * it will trigger the 'build' target in the respective package. Whatever happens during the build
 * is at the discretion of each package.
 */
export class PackageBuilder implements IEventListener {
    private sourceDescriptor: SourceDescriptor | undefined;
    private packageBuildScripts: Record<string, string> = {};

    constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): PackageBuilder {
        return new PackageBuilder(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.onSourceInitialized(event);
                break;
            }
            case "buildRequested": {
                this.onBuildRequested(event);
                break;
            }
        }
    };

    private onSourceInitialized = (event: ISourceInitialized): void => {
        this.sourceDescriptor = event.body.sourceDescriptor;
        this.packageBuildScripts = {};

        const packages = Object.values(this.sourceDescriptor.packages);

        packages.forEach((pkg) => {
            const scripts = Object.keys(pkg.packageJson.scripts ?? {});
            const candidates = intersection(BuildScriptPreference, scripts);

            if (isEmpty(candidates)) {
                appLogWarn(`Unable to determine build script to use for package ${pkg.packageName}`);
            } else {
                this.packageBuildScripts[pkg.packageName] = candidates[0];
            }
        });
    };

    private onBuildRequested = (event: IBuildRequested): void => {
        const packageDescriptor = this.sourceDescriptor!.packages[event.body.packageName];

        this.doBuild(packageDescriptor);
    };

    private doBuild = (packageDescriptor: PackageDescriptor): void => {
        const { directory, packageName } = packageDescriptor;

        const buildScript = this.packageBuildScripts[packageName];
        const stdoutPath = path.join(directory, StdoutFilename);
        const stderrPath = path.join(directory, StderrFilename);

        if (!buildScript) {
            appLogWarn(`Unable to determine build script to use for package ${packageName}. Skipping build.`);

            this.eventBus.post(buildStarted(packageName));
            this.eventBus.post(
                buildFinished({
                    packageName,
                    exitCode: 0,
                    stdoutPath,
                    stderrPath,
                    duration: 0,
                }),
            );

            return;
        }

        appLogInfo(`Running ${buildScript} for ${packageName}`);

        const stdout = fs.openSync(stdoutPath, "w+");
        const stderr = fs.openSync(stderrPath, "w+");
        const startTime = Date.now();

        const build = spawn("npm", ["run", buildScript], {
            cwd: directory,
            stdio: ["ignore", stdout, stderr],
        });

        this.eventBus.post(buildStarted(packageName));

        build.on("close", (exitCode) => {
            const duration = Date.now() - startTime;

            fs.closeSync(stdout);
            fs.closeSync(stderr);

            this.eventBus.post(
                buildFinished({
                    packageName,
                    // exitCode may be null if the rsync was interrupted by a signal; treat that as error
                    exitCode: exitCode ?? 1,
                    stdoutPath,
                    stderrPath,
                    duration,
                }),
            );
        });
    };
}
