// (C) 2020 GoodData Corporation
import { getSourceDescriptor } from "../base/sourceDiscovery";
import { discoverTargetDependencies } from "../base/targetDiscovery";
import { TerminalUi } from "./ui/ui";
import { logInfo, registerLogFn } from "../cli/loggers";
import { appLogInfo } from "./ui/utils";
import { GlobalEventBus, sourceInitialized, targetSelected } from "./events";
import { ChangeDetector } from "./changeDetector";
import { BuildScheduler } from "./buildScheduler";
import { PackageBuilder } from "./packageBuilder";

export async function devConsole(targetDir: string): Promise<number> {
    const sourceDescriptor = await getSourceDescriptor(
        (pkg) => !pkg.projectFolder.startsWith("examples") && !pkg.projectFolder.startsWith("skel"),
    );

    if (!sourceDescriptor) {
        return 1;
    }

    const targetDescriptor = discoverTargetDependencies(targetDir, sourceDescriptor);

    if (!targetDescriptor.dependencies.length) {
        logInfo(`The target project does not have any dependencies on the SDK. There is nothing to do.`);

        return 1;
    }

    /*
     * Register log function so that all messages land in the application's log
     */
    registerLogFn(appLogInfo);

    /*
     * Initialize the terminal UI - this will make the app run forever until user triggers exit
     */
    new TerminalUi();

    /*
     * Initialize components of the watch-build-publish system
     */
    new ChangeDetector();
    new BuildScheduler();
    new PackageBuilder();

    /*
     * Initialize the console with source packages
     */
    GlobalEventBus.post(sourceInitialized(sourceDescriptor));
    GlobalEventBus.post(targetSelected(targetDescriptor));

    return 0;
}
