// (C) 2022-2025 GoodData Corporation
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    DashboardAttributeFilterConfigMode,
    DashboardDateFilterConfigMode,
    FilterContextItem,
    IAttributeElement,
    getAttributeElementsItems,
    isDashboardAttributeFilter,
    IDashboardAttributeFilterConfig,
} from "@gooddata/sdk-model";

import { FilterNaming, useFiltersNamings } from "../../../_staging/sharedHooks/useFiltersNamings.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectDateFilterConfigOverrides,
    selectFilterContextFilters,
    useDashboardSelector,
} from "../../../model/index.js";

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

export function useDashboardRelatedFilters(run: boolean): {
    dateFilters: DashboardRelatedFilter[];
    attributeFilters: DashboardRelatedFilter[];
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
} {
    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();

    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const dateFiltersConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const attributeFiltersConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides);

    const { result, status } = useCancelablePromise(
        {
            promise: async () => {
                if (!run) {
                    return dashboardFilters;
                }
                return Promise.all(
                    dashboardFilters.map((f) =>
                        updateLabelElements(backend, workspaceId, attributeFiltersConfig, f),
                    ),
                );
            },
        },
        [run, dashboardFilters],
    );

    const filters = useFiltersNamings(result ?? []);
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
        isLoading: status === "loading" || status === "pending",
        isError: status === "error",
        isSuccess: status === "success",
        dateFilters: all.filter((f) => f?.type === "dateFilter"),
        attributeFilters: all.filter((f) => f?.type === "attributeFilter"),
    };
}

async function updateLabelElements(
    backend: IAnalyticalBackend,
    workspaceId: string,
    attributeFiltersConfig: IDashboardAttributeFilterConfig[],
    dashboardFilter: FilterContextItem,
): Promise<FilterContextItem> {
    // Skip filters that are not attribute filters
    if (isDashboardAttributeFilter(dashboardFilter)) {
        const config = attributeFiltersConfig.find(
            (c) => c.localIdentifier === dashboardFilter.attributeFilter.localIdentifier,
        );
        const values = getAttributeElementsItems(dashboardFilter.attributeFilter.attributeElements);
        const query = backend
            .workspace(workspaceId)
            .attributes()
            .elements()
            .forDisplayForm(config?.displayAsLabel ?? dashboardFilter.attributeFilter.displayForm)
            .withOptions({
                elements: {
                    values,
                },
                filterByPrimaryLabel: true,
            });

        const data = await query.query();
        const all: IAttributeElement[] = await data.all();

        return {
            ...dashboardFilter,
            attributeFilter: {
                ...dashboardFilter.attributeFilter,
                attributeElements: {
                    values: all.map((a) => a.title),
                },
            },
        };
    }
    return dashboardFilter;
}
