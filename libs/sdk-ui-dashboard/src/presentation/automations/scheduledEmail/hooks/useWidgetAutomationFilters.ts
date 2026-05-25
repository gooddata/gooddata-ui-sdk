// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IFilter,
    type IInsightDefinition,
    filterIsEmpty,
    filterLocalIdentifier,
    isAttributeFilter,
    isNoopAllTimeDateFilter,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useWidgetFilters } from "../../../../model/react/useWidgetFilters.js";
import { selectCrossFilteringItems } from "../../../../model/store/drill/drillSelectors.js";
import { type ICrossFilteringItem } from "../../../../model/store/drill/types.js";
import { type FilterableDashboardWidget } from "../../../../model/types/layoutTypes.js";

export function useWidgetAutomationFilters(widget?: FilterableDashboardWidget, insight?: IInsightDefinition) {
    const widgetFiltersQuery = useWidgetFilters(widget, insight);
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);

    return useMemo(() => {
        const { result: widgetFilters, status: widgetFiltersStatus } = widgetFiltersQuery;
        const sanitizedWidgetFilters = widgetFilters
            ? sanitizeWidgetFilters(widgetFilters, crossFilteringItems)
            : undefined;

        if (widgetFiltersStatus === "success" && sanitizedWidgetFilters) {
            return {
                ...widgetFiltersQuery,
                result: sanitizedWidgetFilters,
            };
        }

        return widgetFiltersQuery;
    }, [crossFilteringItems, widgetFiltersQuery]);
}

function sanitizeWidgetFilters(filters: IFilter[], crossFilteringItems: ICrossFilteringItem[]): IFilter[] {
    const withoutCrossFiltering = removeCrossFilteringFilters(filters, crossFilteringItems);
    const withoutAllTimeDateFilters = removeAllTimeDateFilters(withoutCrossFiltering);
    return removeEmptyAttributeFilters(withoutAllTimeDateFilters);
}

function removeCrossFilteringFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
): IFilter[] {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap((c) => c.filterLocalIdentifiers);
    return filters.filter((filter) => {
        const filterLocalId = filterLocalIdentifier(filter);
        return filterLocalId ? !crossFilteringFilterLocalIdentifiers.includes(filterLocalId) : true;
    });
}

function removeEmptyAttributeFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((filter) => {
        if (isAttributeFilter(filter)) {
            return !filterIsEmpty(filter);
        }

        return true;
    });
}

function removeAllTimeDateFilters(filters: IFilter[]): IFilter[] {
    return filters.filter((filter) => !isNoopAllTimeDateFilter(filter));
}
