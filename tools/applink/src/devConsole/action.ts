// (C) 2020 GoodData Corporation
import { getSourceDescriptor } from "../base/sourceDiscovery";
import { getTargetDescriptor } from "../base/targetDiscovery";
import { TerminalUi } from "./ui/ui";
import { GlobalEventBus, sourceInitialized, targetSelected } from "./events";
import { ChangeDetector } from "./pipeline/changeDetector";
import { BuildScheduler } from "./pipeline/buildScheduler";
import { PackageBuilder } from "./pipeline/packageBuilder";
import { PackagePublisher } from "./pipeline/publisher";

export async function devConsole(targetDir: string): Promise<number> {
    const sourceDescriptor = await getSourceDescriptor(
        (pkg) => !pkg.projectFolder.startsWith("examples") && !pkg.projectFolder.startsWith("skel"),
    );

    if (!sourceDescriptor) {
        return 1;
    }

    const targetDescriptor = getTargetDescriptor(targetDir, sourceDescriptor);

    if (!targetDescriptor.dependencies.length) {
        console.info("The target project does not have any dependencies on the SDK. There is nothing to do.");

        return 1;
    }

    /*
     * Initialize the terminal UI - this will make the app run forever until user triggers exit
     */
    TerminalUi.init();

    /*
     * Initialize components of the watch-build-publish system
     */
    ChangeDetector.init();
    BuildScheduler.init();
    PackageBuilder.init();
    PackagePublisher.init();

    /*
     * Initialize the console with source packages
     */
    GlobalEventBus.post(sourceInitialized(sourceDescriptor));
    GlobalEventBus.post(targetSelected(targetDescriptor));

    return 0;
}
