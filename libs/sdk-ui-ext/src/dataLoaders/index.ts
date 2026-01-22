// (C) 2021-2026 GoodData Corporation

import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader.js";
import { insightDataLoaderFactory } from "./InsightDataLoader.js";
import { type IDataLoaderFactory } from "./types.js";
import { userWorkspaceSettingsDataLoaderFactory } from "./UserWorkspaceSettingsDataLoader.js";
import { workspacePermissionsDataLoaderFactory } from "./WorkspacePermissionsDataLoader.js";

/**
 * Clears all the caches used by the InsightView components.
 *
 * @public
 */
export function clearInsightViewCaches(): void {
    const relevantFactories: IDataLoaderFactory<unknown>[] = [
        colorPaletteDataLoaderFactory,
        insightDataLoaderFactory,
        userWorkspaceSettingsDataLoaderFactory,
    ];
    relevantFactories.forEach((factory) => factory.reset());
}

export {
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
    workspacePermissionsDataLoaderFactory,
};
