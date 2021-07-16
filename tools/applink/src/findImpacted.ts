// (C) 2020-2021 GoodData Corporation

import * as readline from "readline";
import { getSourceDescriptor, identifyChangedPackages } from "./base/sourceDiscovery";
import { findDependingPackages } from "./base/dependencyGraph";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";

export async function findImpacted() {
    const sourceDescriptor = await getSourceDescriptor(undefined, true);

    if (!sourceDescriptor) {
        process.stderr.write("Unable to load source descriptor. Exiting with error.\n");

        return 1;
    }

    // Using readline to get stdin line-by-line; trying readFileSync for stdin was failing when this code
    //  was triggered by rush.
    const io = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const listOfFiles: string[] = [];
    let resolve: () => void;
    let reject: (err: any) => void;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    io.on("line", (line) => {
        listOfFiles.push(line);
    });

    io.on("close", () => {
        try {
            const changedPackages = identifyChangedPackages(sourceDescriptor, listOfFiles).map(
                (p) => p.packageName,
            );
            const dependencyGraph = sourceDescriptor.dependencyGraph;
            const allImpactedPackages = changedPackages.concat(
                uniq(flatten(findDependingPackages(dependencyGraph, changedPackages))),
            );

            const packageDescriptors = allImpactedPackages.map((pkg) => sourceDescriptor.packages[pkg]);
            const packageDirs = packageDescriptors.map((p) => p.rushPackage.projectFolder);

            process.stdout.write(packageDirs.join("\n") + "\n");
            resolve();
        } catch (e) {
            reject(e);
        }
    });

    return promise;
}
