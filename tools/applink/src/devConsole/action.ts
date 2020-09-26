// (C) 2020 GoodData Corporation
import { getSdkDescriptor } from "../base/sdkPackages";
import path from "path";
import { DependencyOnSdk } from "../devTo/dependencyDiscovery";
import { TerminalUi } from "./ui/ui";
import { registerLogFn } from "../cli/loggers";
import { appLogMessage } from "./ui/utils";
import { GlobalEventBus, PackagesInitialized } from "./events";

export async function devConsole(): Promise<number> {
    const sdk = await getSdkDescriptor();

    if (!sdk) {
        return 1;
    }

    /*
     * Initializes the terminal UI.
     */
    new TerminalUi();

    /*
     * Register log function so that all messages land in the application's log
     */
    registerLogFn(appLogMessage);

    const packagesInitialized: PackagesInitialized = {
        type: "packagesInitialized",
        body: {
            graph: sdk.dependencyGraph,
            packages: Object.values(sdk.packages),
        },
    };

    GlobalEventBus.post(packagesInitialized);

    return 0;
}

//
//
//

export function createWatchDirs(deps: DependencyOnSdk[]): string[] {
    return deps.map((dep) => {
        return path.join(dep.pkg.directory, "src");
    });
}
