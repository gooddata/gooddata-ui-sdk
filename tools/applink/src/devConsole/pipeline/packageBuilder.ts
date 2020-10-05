// (C) 2020 GoodData Corporation
import fs from "fs";
import path from "path";
import spawn from "cross-spawn";
import { PackageDescriptor, SourceDescriptor } from "../../base/types";
import {
    buildFinished,
    BuildRequested,
    buildStarted,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
} from "../events";

const StdoutFilename = "applink.log";
const StderrFilename = "applink.error.log";

/**
 * Package builder initialized itself after SourceInitialized event. And then as BuildRequested events appear,
 * it will trigger the 'build-incremental' target in the respective package. Whatever happens during the build-incremental
 * is at the discretion of each package.
 */
export class PackageBuilder implements IEventListener {
    private sourceDescriptor: SourceDescriptor | undefined;

    constructor(private readonly eventBus: EventBus) {
        this.eventBus.register(this);
    }

    public static init(eventBus: EventBus = GlobalEventBus): PackageBuilder {
        return new PackageBuilder(eventBus);
    }

    public onEvent = (event: DcEvent): void => {
        switch (event.type) {
            case "sourceInitialized": {
                this.sourceDescriptor = event.body.sourceDescriptor;

                break;
            }
            case "buildRequested": {
                this.onBuildRequested(event);
                break;
            }
        }
    };

    private onBuildRequested = (event: BuildRequested): void => {
        const packageDescriptor = this.sourceDescriptor!.packages[event.body.packageName];

        this.doBuild(packageDescriptor);
    };

    private doBuild = (packageDescriptor: PackageDescriptor): void => {
        const { directory, packageName } = packageDescriptor;
        const stdoutPath = path.join(directory, StdoutFilename);
        const stderrPath = path.join(directory, StderrFilename);
        const stdout = fs.openSync(stdoutPath, "w+");
        const stderr = fs.openSync(stderrPath, "w+");

        const startTime = Date.now();
        const build = spawn("npm", ["run", "build-incremental"], {
            cwd: directory,
            stdio: ["ignore", stdout, stderr],
        });

        this.eventBus.post(buildStarted(packageName));

        build.on("close", (exitCode) => {
            const duration = Date.now() - startTime;

            GlobalEventBus.post(
                buildFinished({
                    packageName,
                    exitCode,
                    stdoutPath,
                    stderrPath,
                    duration,
                }),
            );
        });
    };
}
