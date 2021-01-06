// (C) 2021 GoodData Corporation
import { IDataLoaderFactory } from "./types";
import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader";
import { insightDataLoaderFactory } from "./InsightDataLoader";
import { userWorkspaceSettingsDataLoaderFactory } from "./UserWorkspaceSettingsDataLoader";

export function clearInsightViewCaches(): void {
    const relevantFactories: IDataLoaderFactory<unknown>[] = [
        colorPaletteDataLoaderFactory,
        insightDataLoaderFactory,
        userWorkspaceSettingsDataLoaderFactory,
    ];
    relevantFactories.forEach((factory) => factory.reset());
}

export { colorPaletteDataLoaderFactory, insightDataLoaderFactory, userWorkspaceSettingsDataLoaderFactory };
