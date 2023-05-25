// (C) 2021-2022 GoodData Corporation
import { IDataLoaderFactory } from "./types.js";
import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader.js";
import { insightDataLoaderFactory } from "./InsightDataLoader.js";
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
