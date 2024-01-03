// (C) 2020 GoodData Corporation

import path from "path";
import { readJsonSync } from "./utils.js";
import { AllDepdencyTypes, DependencyGraph, DependencyType, PackageDescriptor } from "./types.js";
import difference from "lodash/difference.js";
import flatMap from "lodash/flatMap.js";
import fromPairs from "lodash/fromPairs.js";
import groupBy from "lodash/groupBy.js";
import intersection from "lodash/intersection.js";

function addDependencies(
    graph: DependencyGraph,
    from: string,
    toPackages: Record<string, string> | undefined,
    type: DependencyType,
) {
    if (!toPackages) {
        return;
    }

    for (const to of Object.keys(toPackages)) {
        if (!graph.nodesSet.has(to)) {
            continue;
        }

        graph.edges.push({
            from,
            to,
            type,
        });
    }
}
/**
 * Given SDK packages, this function will construct the package dependency graph. This will be a directed acyclic graph.
 *
 * Note: this function does not check for cycles and relies on our current rush setup that prevents cycles.
 *
 * See {@link DependencyGraph}
 *
 * @param packages - list of packages
 */
export function createDependencyGraph(packages: PackageDescriptor[]): DependencyGraph {
    const graph: DependencyGraph = {
        nodes: [],
        edges: [],
        nodesSet: new Set<string>(),
        outgoing: {},
        incoming: {},
    };

    for (const pkg of packages) {
        graph.nodes.push(pkg.packageName);
        graph.nodesSet.add(pkg.packageName);
    }

    for (const pkg of packages) {
        const packageJson = readJsonSync(path.join(pkg.directory, "package.json"));
        const depedencies: Record<string, string> = packageJson.dependencies;
        const devDependencies: Record<string, string> = packageJson.devDependencies;
        const peerDependencies: Record<string, string> = packageJson.peerDependencies;

        addDependencies(graph, pkg.packageName, depedencies, "prod");
        addDependencies(graph, pkg.packageName, devDependencies, "dev");
        addDependencies(graph, pkg.packageName, peerDependencies, "peer");
    }

    return {
        ...graph,
        outgoing: groupBy(graph.edges, (e) => e.from),
        incoming: groupBy(graph.edges, (e) => e.to),
    };
}

/**
 * Naive dependency graph filtering. This will filter the input graph so that it only contains `packages` and
 * edges only between `packages`.
 *
 * This simple filtering is OK to use if the `packages` already are a transitive closure of all inter-dependent
 * packages. For instance devConsole uses this filtering to filter dependency graph to only those packages which
 * are used by the target app - it gets the correct results because the packages used in the target are resolved by
 * `npm` and are transitive closure.
 *
 * @param graph - input dependency graph
 * @param packages - packages to filter to (see function contract for more)
 */
export function naiveFilterDependencyGraph(graph: DependencyGraph, packages: string[]): DependencyGraph {
    const newEdges = graph.edges.filter((e) => intersection([e.from, e.to], packages).length === 2);
    const newNodes = intersection(graph.nodes, packages);
    const nodesSet: Set<string> = new Set<string>();

    newNodes.forEach((node) => nodesSet.add(node));

    return {
        nodes: newNodes,
        edges: newEdges,
        nodesSet,
        outgoing: groupBy(newEdges, (e) => e.from),
        incoming: groupBy(newEdges, (e) => e.to),
    };
}

/**
 * Given a list of SDK packages, this function will find all packages that depend on them. The function returns
 * results partitioned by input package. For each package on input, there will be an entry in the resulting array which
 * will contain an array of all dependent packages.
 *
 * @param graph - dependency graph
 * @param packages - packages to get dependencies for
 * @param depTypes - dependency types to follow - defaults to all
 */
export function findDependingPackages(
    graph: DependencyGraph,
    packages: Array<string | PackageDescriptor>,
    depTypes: DependencyType[] = AllDepdencyTypes,
): string[][] {
    const names = packages.map((p) => (typeof p === "string" ? p : p.packageName));
    const results: string[][] = [];

    for (const pkg of names) {
        let remaining = [pkg];
        const result: Set<string> = new Set<string>();

        while (remaining.length > 0) {
            /*
             * For all remaining packages to investigate, check out which packages are depending on them,
             * add them to result and then prepare for the next cycle
             */
            const depending = flatMap(
                remaining,
                (p) => graph.incoming[p]?.filter((d) => depTypes.includes(d.type)).map((d) => d.from) ?? [],
            );

            depending.forEach((p) => result.add(p));
            remaining = depending;
        }

        results.push(Array.from(result.keys()));
    }

    return results;
}

/**
 * Determines the SDK packages build order. The result is the SDK packages grouped so that packages in each group
 * can be safely built in parallel and the next group can only be built if the previous group is built.
 *
 * @param graph - dependency graph to create build order for
 * @param depTypes - dependency types
 */
export function determinePackageBuildOrder(
    graph: DependencyGraph,
    depTypes: DependencyType[] = AllDepdencyTypes,
): string[][] {
    /*
     * The algorithm to achieve this does 'shave' the packages from the leaves up to the roots. The package
     * can only be shaved-off if all packages which it depends on have already been shaved off.
     */
    const allShavedOffDependencies: Record<string, string[]> = fromPairs(
        graph.nodes.map((node) => [node, []]),
    );
    const groups: string[][] = [];

    // Start with the leaves = those nodes for which there are no outgoing edges
    let walkEntries: string[] = [...difference(graph.nodes, Object.keys(graph.outgoing))];

    while (walkEntries.length > 0) {
        // All entries are possible candidates to form a group of packages that can be built together
        const possibleGroup = walkEntries;
        // Entries collected for next walk as they did not meet criteria to enter a group in this iteration
        const nextWalk = new Set<string>();
        // Dependencies that have been shaved-off during this iteration. These have to be collected and 'commited'
        //  only at the end of the iteration
        const shavedOffByThisGroup: string[][] = [];
        // Current group
        const group = [];

        while (possibleGroup.length > 0) {
            const pkg = possibleGroup.pop()!;
            const packageDependencies =
                graph.outgoing[pkg]?.filter((d) => depTypes.includes(d.type)).map((d) => d.to) ?? [];
            const shavedForThisPackage = allShavedOffDependencies[pkg]!;
            const leftToShaveOff = difference(packageDependencies, shavedForThisPackage);

            if (!leftToShaveOff.length) {
                /*
                 * If all package's deps were already shaved-off, then it can be added to the group. The packages
                 * that depend on this shaved-off package can be considered for the next group.
                 */
                group.push(pkg);

                const dependents =
                    graph.incoming[pkg]?.filter((d) => depTypes.includes(d.type)).map((d) => d.from) ?? [];

                for (const dep of dependents) {
                    shavedOffByThisGroup.push([dep, pkg]);
                    nextWalk.add(dep);
                }
            } else {
                /*
                 * Package has still some outstanding dependencies that must be shaved-off. Try again next iteration.
                 */
                nextWalk.add(pkg);
            }
        }

        if (group.length === 0) {
            /*
             * If this happens then there must be cycles in the graph.
             */
            throw new Error();
        }

        groups.push(group);

        shavedOffByThisGroup.forEach(([from, to]) => {
            allShavedOffDependencies[from].push(to);
        });
        walkEntries = Array.from(nextWalk.keys());
    }

    return groups;
}
