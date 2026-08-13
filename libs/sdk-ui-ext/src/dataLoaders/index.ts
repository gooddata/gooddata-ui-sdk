// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader.js";
import { insightDataLoaderFactory } from "./InsightDataLoader.js";
import { type IDataLoaderFactory } from "./types.js";
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

/**
 * Clears the cached definition of a single insight used by the InsightView components.
 *
 * @remarks
 * Use this after an insight has been edited, so that the next render fetches the new
 * definition. To clear every cache at once, use {@link clearInsightViewCaches}.
 *
 * @param workspace - the workspace the insight belongs to
 * @param ref - the ref of the insight whose cached definition should be dropped
 * @public
 */
export function clearInsightViewCacheForInsight(workspace: string, ref: ObjRef): void {
    insightDataLoaderFactory.forWorkspace(workspace).invalidateInsight(ref);
}
