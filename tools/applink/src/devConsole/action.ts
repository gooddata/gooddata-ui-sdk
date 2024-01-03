// (C) 2020-2021 GoodData Corporation
import { getSourceDescriptor } from "../base/sourceDiscovery.js";
import { getTargetDescriptor } from "../base/targetDiscovery.js";
import { TerminalUi } from "./ui/ui.js";
import { GlobalEventBus, sourceInitialized, targetSelected } from "./events.js";
import { ChangeDetector } from "./pipeline/changeDetector.js";
import { BuildScheduler } from "./pipeline/buildScheduler.js";
import { PackageBuilder } from "./pipeline/packageBuilder.js";
import { PackagePublisher } from "./pipeline/publisher.js";
import { SourceDescriptor, TargetDependency, TargetDescriptor } from "../base/types.js";
import { NoopPublisher } from "./pipeline/noopPublisher.js";

export async function devConsole(targetDir: string): Promise<void> {
    const sourceDescriptor = await getSourceDescriptor(
        (pkg) => !pkg.projectFolder.startsWith("examples") && !pkg.projectFolder.startsWith("skel"),
    );

    if (!sourceDescriptor) {
        return;
    }

    const targetDescriptor = getTargetDescriptor(targetDir, sourceDescriptor);

    if (!targetDescriptor.dependencies.length) {
        console.info("The target project does not have any dependencies on the SDK. There is nothing to do.");

        return;
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
}

function createInPlaceTargetDescriptor(source: SourceDescriptor): TargetDescriptor {
    const dependencies: TargetDependency[] = Object.values(source.packages).map((pkg) => {
        return {
            pkg,
            directory: pkg.directory,
            packageJson: pkg.packageJson,
            version: pkg.packageJson.version,
        };
    });

    return {
        root: ".",
        dependencies,
    };
}

export async function autoBuild(): Promise<void> {
    const sourceDescriptor = await getSourceDescriptor(
        (pkg) => !pkg.projectFolder.startsWith("examples") && !pkg.projectFolder.startsWith("skel"),
    );

    if (!sourceDescriptor) {
        return;
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
    NoopPublisher.init();

    /*
     * Initialize the console with source packages
     */
    GlobalEventBus.post(sourceInitialized(sourceDescriptor));
    GlobalEventBus.post(targetSelected(createInPlaceTargetDescriptor(sourceDescriptor)));
}
