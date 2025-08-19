// (C) 2021-2025 GoodData Corporation
import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader.js";
import { insightDataLoaderFactory } from "./InsightDataLoader.js";
import { IDataLoaderFactory } from "./types.js";
import { userWorkspaceSettingsDataLoaderFactory } from "./UserWorkspaceSettingsDataLoader.js";

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

export { colorPaletteDataLoaderFactory, insightDataLoaderFactory, userWorkspaceSettingsDataLoaderFactory };
