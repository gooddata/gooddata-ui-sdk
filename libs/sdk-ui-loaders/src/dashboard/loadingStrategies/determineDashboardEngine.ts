// (C) 2021-2022 GoodData Corporation
import { IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import { compareBuild as semverCompareBuild, satisfies as semverSatisfies } from "semver";

/**
 * Determine dashboard engine to use with the plugins.
 * Currently it selects the engine with the greatest version.
 *
 * @internal
 */
export function determineDashboardEngine(engines: IDashboardEngine[]): IDashboardEngine {
    const sortedByVersion = [...engines].sort((engineA, engineB) =>
        semverCompareBuild(engineB.version, engineA.version),
    );
    const [engineWithGreatestVersion] = sortedByVersion;
    return engineWithGreatestVersion;
}

/**
 * Checks if the dashboard plugin match version of the dashboard engine.
 *
 * @internal
 */
export function isPluginCompatibleWithDashboardEngine(
    engine: IDashboardEngine,
    plugin: IDashboardPluginContract_V1,
): boolean {
    const { minEngineVersion, maxEngineVersion, debugName, displayName, version } = plugin;
    const requiredVersion = `>=${minEngineVersion}${maxEngineVersion ? " <=" + maxEngineVersion : ""}`;
    const matchesEngineVersion = semverSatisfies(engine.version, requiredVersion, {
        includePrerelease: true,
    });
    if (!matchesEngineVersion) {
        console.error(
            `The dashboard plugin ${
                debugName ?? displayName
            } ${version} requires engine with version ${requiredVersion}, but the loaded dashboard engine has version ${
                engine.version
            }.`,
        );
    }
    return matchesEngineVersion;
}
