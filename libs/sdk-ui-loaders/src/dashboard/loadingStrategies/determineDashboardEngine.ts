// (C) 2021 GoodData Corporation
// import semver from 'semver';
import { IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import semverCompareBuild from "semver/functions/compare-build";
import semverSatisfies from "semver/functions/satisfies";

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
    const matchesEngineVersion = semverSatisfies(engine.version, requiredVersion);
    if (!matchesEngineVersion) {
        // eslint-disable-next-line no-console
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
