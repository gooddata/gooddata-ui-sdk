// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend, type IGeoStyleListItem } from "@gooddata/sdk-backend-spi";

import { type IDropdownItem } from "../../../interfaces/Dropdown.js";

export class GeoBasemapItemsLoader {
    private items: IGeoStyleListItem[] = [];
    private isLoading = false;
    private isLoaded = false;

    public constructor(private readonly backend: IAnalyticalBackend) {}

    public ensureLoaded(onChange: () => void): void {
        if (this.isLoaded || this.isLoading) {
            return;
        }

        this.isLoading = true;

        Promise.resolve()
            .then(() => this.backend.geo().getStyles())
            .then((items) => {
                this.items = items;
            })
            .catch(() => {
                // Silently ignore errors so the configuration panel can still render.
                this.items = [];
            })
            .finally(() => {
                this.isLoading = false;
                this.isLoaded = true;
                onChange();
            });
    }

    public getItems(): IGeoStyleListItem[] {
        return this.items;
    }

    public getIsLoading(): boolean {
        return this.isLoading;
    }
}

export function getGeoBasemapDropdownItems(
    apiItems: readonly IGeoStyleListItem[],
    currentBasemap: string | undefined,
): IDropdownItem[] {
    const dynamicItems: IDropdownItem[] = apiItems.map((item) => ({
        title: item.title,
        value: item.id,
    }));

    if (currentBasemap === undefined || dynamicItems.some((item) => item.value === currentBasemap)) {
        return dynamicItems;
    }

    return [...dynamicItems, { title: currentBasemap, value: currentBasemap }];
}

export function getGeoConfigurationPanelIsLoading(
    isVisualizationLoading: boolean,
    isBasemapItemsLoading: boolean,
): boolean {
    return isVisualizationLoading || isBasemapItemsLoading;
}
