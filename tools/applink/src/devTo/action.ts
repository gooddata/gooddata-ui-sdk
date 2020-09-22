// (C) 2020 GoodData Corporation
import { getSdkDescriptor } from "../base/sdkPackages";
import path from "path";
import { logError, logInfo } from "../cli/loggers";
import { DependencyOnSdk, findSdkDependencies } from "./dependencyDiscovery";
import chokidar from "chokidar";
import { IncrementalBuilder } from "./incrementalBuilder";
import { DevBuildPublisher } from "./publisher";
import { SdkDescriptor } from "../base/types";
import { filterBuildErrors, PackageBuilder } from "./packageBuilder";

async function watchAndRebuildLoop(sdk: SdkDescriptor, deps: DependencyOnSdk[]): Promise<void> {
    const buildPublisher = new DevBuildPublisher(deps);
    const packageBuilder = new PackageBuilder(sdk, deps);

    logInfo(`Doing initial build of all required packages`);

    const errors = filterBuildErrors(await packageBuilder.buildAll());

    if (errors.length) {
        logError(
            `The initial build has failed for one or more packages. Please correct and start again. The packages: ${errors
                .map((e) => e.sdkPackage.packageName)
                .join(", ")}`,
        );

        return;
    }

    buildPublisher.onNewBuildsReady(deps.map((d) => d.pkg));

    logInfo(`Entering watch and incremental build loop for ${deps.length} package(s).`);

    const incrementalBuilder = new IncrementalBuilder(sdk, packageBuilder, buildPublisher.onNewBuildsReady);
    const watcher = chokidar.watch(createWatchDirs(deps), {
        atomic: true,
        persistent: true,
        ignoreInitial: true,
        cwd: sdk.root,
    });

    watcher
        .on("add", (path) => incrementalBuilder.onSourceChange(path, "add"))
        .on("change", (path) => incrementalBuilder.onSourceChange(path, "change"))
        .on("unlink", (path) => incrementalBuilder.onSourceChange(path, "unlink"));
}

export async function devTo(target: string): Promise<number> {
    const sdk = await getSdkDescriptor();

    if (!sdk) {
        return 1;
    }

    const absolutePath = path.resolve(target);
    logInfo(`devTo: ${absolutePath}`);

    const dependencies = findSdkDependencies(absolutePath, sdk);

    if (!dependencies.length) {
        logInfo(`The target project does not have any dependencies on the SDK. There is nothing to do.`);

        return 1;
    }

    logInfo(
        `The target project references the following SDK libraries (${
            dependencies.length
        }):\n\t${dependencies.map((dep) => `${dep.pkg.packageName} @ ${dep.version}`).join("\n\t")}`,
    );

    await watchAndRebuildLoop(sdk, dependencies);

    return 0;
}

//
//
//

function createWatchDirs(deps: DependencyOnSdk[]): string[] {
    return deps.map((dep) => {
        return path.join(dep.pkg.directory, "src");
    });
}
