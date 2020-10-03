// (C) 2020 GoodData Corporation
import fs from "fs";
import path from "path";
import spawn from "cross-spawn";
import { PackageDescriptor, SourceDescriptor } from "../base/types";
import {
    buildFinished,
    BuildRequested,
    buildStarted,
    DcEvent,
    EventBus,
    GlobalEventBus,
    IEventListener,
} from "./events";
import { appLogInfo } from "./ui/utils";

const StdoutFilename = "applink.log";
const StderrFilename = "applink.error.log";

export class PackageBuilder implements IEventListener {
    private sourceDescriptor: SourceDescriptor | undefined;

    constructor(private readonly eventBus: EventBus = GlobalEventBus) {
        this.eventBus.register(this);
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

        appLogInfo(`[${packageName}] Starting incremental build.`);

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
