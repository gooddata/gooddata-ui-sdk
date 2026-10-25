// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAttributeElement } from "@gooddata/sdk-model";

import { type Granularity } from "../models/granularity.js";
import { getAdditionalDateAttributeFilters } from "../store/filter_bar/filter_bar_selector.js";
import { FilterBar, type IAttributeFilter } from "../store/filter_bar/filter_bar_types.js";
import { type ICatalogEntries } from "../typings/state_objects.js";

import { getItemCache } from "./item_cache_selector.js";

export interface IAdditionalDateFilterLabel {
    granularity: Granularity;
    isAllSelected: boolean;
    isInverted: boolean;
    selectionSize: number;
    /** unknown when the filter's elements were not loaded (e.g. a reopened metric filter) */
    totalElementsCount?: number;
    selectedElements: {
        title: string;
        available: boolean;
        formattedTitle?: string;
    }[];
}

export const getAdditionalDateFiltersLabel = createSelector(
    getAdditionalDateAttributeFilters,
    getItemCache,
    (
        attributeFilters: ReadonlyArray<IAttributeFilter>,
        itemCache: ICatalogEntries,
    ): IAdditionalDateFilterLabel[] => {
        if (!attributeFilters) {
            return [];
        }

        return attributeFilters
            .map((filter) => {
                const cacheItem = itemCache[filter.cacheItemIdentifier];
                // a date entry's `dateType` IS the granularity (`GDC.time.*`)
                const granularity = cacheItem?.dateType as Granularity;

                const selectedElements = filter.filterConfig.selectedElements.map((element) => {
                    const { formattedTitle, title } = element as IAttributeElement;
                    const elementFormattedTitle = formattedTitle ? { formattedTitle } : {};

                    return {
                        title,
                        available: element.available !== false,
                        ...elementFormattedTitle,
                    };
                });

                const selectionSize = selectedElements.filter((element) => element.available).length;
                const { isInverted, totalElementsCount } = filter.filterConfig;

                return {
                    granularity,
                    isAllSelected: FilterBar.isAttributeFilterSelectAll(filter.filterConfig),
                    isInverted,
                    selectionSize,
                    selectedElements,
                    totalElementsCount,
                };
            })
            .filter((filter) => !filter.isAllSelected);
    },
);
