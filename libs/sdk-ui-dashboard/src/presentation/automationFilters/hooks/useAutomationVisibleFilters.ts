// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";

import { FilterContextItem, IAutomationVisibleFilter } from "@gooddata/sdk-model";

import {
    useFiltersByTabNamings,
    useFiltersNamings,
} from "../../../_staging/sharedHooks/useFiltersNamings.js";

export const useAutomationVisibleFilters = (
    availableFilters: FilterContextItem[] | undefined = [],
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
    availableFilters: Record<string, FilterContextItem[]> | undefined = {},
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
