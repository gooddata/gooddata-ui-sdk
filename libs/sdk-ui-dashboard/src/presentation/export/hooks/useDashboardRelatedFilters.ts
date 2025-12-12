// (C) 2022-2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterConfigMode,
    type DashboardDateFilterConfigMode,
    type FilterContextItem,
    type IAttributeElement,
    type IDashboardAttributeFilterConfig,
    areObjRefsEqual,
    getAttributeElementsItems,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type FilterNaming, useFiltersNamings } from "../../../_staging/sharedHooks/useFiltersNamings.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectDateFilterConfigOverrides,
    selectDateFilterConfigsOverrides,
    selectEnablePreserveFilterSelectionDuringInit,
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
    const dateFilterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const dateFiltersConfig = useDashboardSelector(selectDateFilterConfigsOverrides);
    const attributeFiltersConfig = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const enablePreserveFilterSelectionDuringInit = useDashboardSelector(
        selectEnablePreserveFilterSelectionDuringInit,
    );

    const { result, status } = useCancelablePromise(
        {
            promise: async () => {
                if (!run) {
                    return dashboardFilters;
                }
                return Promise.all(
                    dashboardFilters.map((f) =>
                        updateLabelElements(
                            backend,
                            workspaceId,
                            attributeFiltersConfig,
                            f,
                            enablePreserveFilterSelectionDuringInit,
                        ),
                    ),
                );
            },
        },
        [run, dashboardFilters],
    );

    const filters = useFiltersNamings(result ?? []);
    const all = (filters.filter((f) => f && !f.all) as FilterNaming[]).map((f) => {
        if (f?.common) {
            return {
                ...f,
                mode: dateFilterConfig?.mode,
            };
        } else if (f?.type === "dateFilter") {
            return {
                ...f,
                mode: dateFiltersConfig.find((c) => areObjRefsEqual(c.dateDataSet, f?.dataSet))?.config?.mode,
            };
        }

        return {
            ...f,
            mode: attributeFiltersConfig.find((c) => c.localIdentifier === f?.id)?.mode,
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
    enablePreserveFilterSelectionDuringInit: boolean,
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

        if (!all.length && enablePreserveFilterSelectionDuringInit) {
            return dashboardFilter;
        }

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
