// (C) 2022-2025 GoodData Corporation
import {
    selectAttributeFilterConfigsOverrides,
    selectDateFilterConfigOverrides,
    selectFilterContextFilters,
    useDashboardSelector,
} from "../../../model/index.js";
import { FilterNaming, useFiltersNamings } from "../../../_staging/sharedHooks/useFiltersNamings.js";
import { DashboardAttributeFilterConfigMode, DashboardDateFilterConfigMode } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type DashboardRelatedFilter = {
    type: "attributeFilter" | "dateFilter";
    all: boolean;
    id: string;
    title: string;
    subtitle: string;
    common?: true;
    mode: DashboardDateFilterConfigMode | DashboardAttributeFilterConfigMode;
};

export function useDashboardRelatedFilters(): {
    dateFilters: DashboardRelatedFilter[];
    attributeFilters: DashboardRelatedFilter[];
} {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const dateFiltersConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const attributeFiltersConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const filters = useFiltersNamings(dashboardFilters);

    const all = (filters.filter((f) => f && !f.all) as FilterNaming[]).map((f) => {
        return {
            ...f,
            ...(f?.type === "dateFilter" && f?.common
                ? {
                      mode: dateFiltersConfig?.mode,
                  }
                : {
                      mode: attributeFiltersConfig.find((c) => c.localIdentifier === f?.id)?.mode,
                  }),
        };
    }) as DashboardRelatedFilter[];

    return {
        dateFilters: all.filter((f) => f?.type === "dateFilter"),
        attributeFilters: all.filter((f) => f?.type === "attributeFilter"),
    };
}
