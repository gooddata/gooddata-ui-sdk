// (C) 2020 GoodData Corporation
import { getSdkPackages, SdkDescriptor } from "../base/sdkPackages";
import path from "path";
import fs from "fs";
import { logError, logInfo } from "../cli/loggers";
import { DependencyOnSdk, findSdkDependencies } from "../base/dependencyDiscovery";
import chokidar from "chokidar";
import { IncrementalBuilder } from "./incrementalBuilder";

async function watchAndRebuildLoop(sdk: SdkDescriptor, deps: DependencyOnSdk[]): Promise<void> {
    logInfo(`Entering watch and incremental build loop for ${deps.length} package(s).`);

    const incrementalBuilder = new IncrementalBuilder(sdk);
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
    const sdk = await getSdkPackages();

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
        }):\n\t\t\t${dependencies.map((dep) => `${dep.pkg.packageName} @ ${dep.version}`).join("\n\t\t\t")}`,
    );

    const unbuiltPackages = findUnbuiltPackages(dependencies);

    if (unbuiltPackages.length > 0) {
        logError(
            `The SDK is not built entirely. Please run 'rush build'. The following packages are missing dist:\n\t\t\t${unbuiltPackages
                .map((dep) => dep.pkg.packageName)
                .join("\n\t\t\t")}`,
        );

        return 1;
    }

    await watchAndRebuildLoop(sdk, dependencies);

    return 0;
}

//
//
//

function findUnbuiltPackages(deps: DependencyOnSdk[]): DependencyOnSdk[] {
    return deps.filter((dep) => {
        const dist = path.join(dep.pkg.directory, "dist");

        return !fs.existsSync(dist) || !fs.statSync(dist).isDirectory();
    });
}

function createWatchDirs(deps: DependencyOnSdk[]): string[] {
    return deps.map((dep) => {
        return path.join(dep.pkg.directory, "src");
    });
}
