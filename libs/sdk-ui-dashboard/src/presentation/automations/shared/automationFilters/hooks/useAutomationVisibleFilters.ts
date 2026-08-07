// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";

import { type FilterContextItem, type IAutomationVisibleFilter } from "@gooddata/sdk-model";

import { useFiltersByTabNamings, useFiltersNamings } from "../../hooks/useFiltersNamings.js";

// Module-level, not inline `= []` / `= {}` defaults: a default parameter is evaluated per call, so an
// inline default hands a fresh reference to the namings memos on every render of a caller that passes
// nothing - which would leave the chain unstable for exactly that caller. Do not inline these back.
const EMPTY_FILTERS: FilterContextItem[] = [];
const EMPTY_FILTERS_BY_TAB: Record<string, FilterContextItem[]> = {};

export const useAutomationVisibleFilters = (
    availableFilters: FilterContextItem[] | undefined = EMPTY_FILTERS,
): IAutomationVisibleFilter[] => {
    const filterNamings = useFiltersNamings(availableFilters);

    return useMemo(() => {
        return compact(filterNamings).map((filter) => {
            return {
                title: filter.title,
                localIdentifier: filter.id,
                isAllTimeDateFilter: false,
            };
        });
    }, [filterNamings]);
};

export const useAutomationVisibleFiltersByTab = (
    availableFilters: Record<string, FilterContextItem[]> | undefined = EMPTY_FILTERS_BY_TAB,
): Record<string, IAutomationVisibleFilter[]> => {
    const filterNamings = useFiltersByTabNamings(availableFilters);

    return useMemo(() => {
        const result: Record<string, IAutomationVisibleFilter[]> = {};
        return Object.entries(filterNamings).reduce((acc, [tabId, namings]) => {
            acc[tabId] = compact(namings).map((naming) => ({
                title: naming.title,
                localIdentifier: naming.id,
                isAllTimeDateFilter: false,
            }));
            return acc;
        }, result);
    }, [filterNamings]);
};
