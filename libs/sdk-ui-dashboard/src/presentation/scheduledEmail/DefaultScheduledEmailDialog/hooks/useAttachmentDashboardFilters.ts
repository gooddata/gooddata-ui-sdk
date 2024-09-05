// (C) 2024 GoodData Corporation

import {
    areObjRefsEqual,
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    ObjRef,
} from "@gooddata/sdk-model";
import { DateFilterOption } from "@gooddata/sdk-ui-filters";
import isEqual from "lodash/isEqual.js";

import { useFiltersNamings } from "../../../../_staging/sharedHooks/useFiltersNamings.js";
import {
    ExtendedDashboardWidget,
    ICrossFilteringItem,
    selectAttributeFilterConfigsDisplayAsLabelMap,
    selectCrossFilteringItems,
    selectEffectiveAttributeFiltersModeMap,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFiltersModeMap,
    selectFilterContextFilters,
    selectOriginalFilterContextFilters,
    useDashboardSelector,
} from "../../../../model/index.js";

export interface IAttachmentFilterInfo {
    id: string;
    title: string;
    subtitle: string;
    attributeFilterValues?: (string | null)[];
    isAttributeFilterNegative?: boolean;
    dateFilterOption?: DateFilterOption;
}

interface IUseAttachmentFilters {
    /**
     * Is there some ad-hoc change of filters on the dashboard compared to original filters state?
     *
     * @remarks Excluding cross-filtering.
     */
    areFiltersChanged: boolean;
    /**
     * Is cross filtering currently in action?
     */
    isCrossFiltering: boolean;
    /**
     * Dashboard filters without cross-filtering intended for metadata storing.
     */
    filtersToStore: FilterContextItem[];
    /**
     * Information about dashboard filters without cross-filtering and hidden filters intended for UI usage.
     */
    filtersToDisplayInfo: IAttachmentFilterInfo[];
}

export const useAttachmentDashboardFilters = ({
    customFilters,
    widget,
}: {
    /**
     * Custom filters from metadata object to use instead of the current filters.
     */
    customFilters?: FilterContextItem[];
    /**
     * Widget in case of widget attachments.
     */
    widget?: ExtendedDashboardWidget;
}): IUseAttachmentFilters => {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const effectiveFilters = customFilters ? [...customFilters] : [...dashboardFilters];

    // remove cross-filtering to get filters for storing
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const isCrossFiltering = crossFilteringItems.length > 0;
    const filtersWithoutCrossFiltering = removeCrossFilteringFilters(effectiveFilters, crossFilteringItems);

    // compare stored dashboard filters with filters to store
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const areFiltersChanged = !isEqual(filtersWithoutCrossFiltering, originalFilters);

    // remove ignored widget filters
    const displayAsLabelMap = useDashboardSelector(selectAttributeFilterConfigsDisplayAsLabelMap);
    const filtersToStore = removeIgnoredWidgetFilters(
        filtersWithoutCrossFiltering,
        widget,
        displayAsLabelMap,
    );

    // additionally remove hidden filters to get filters suitable for display
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const filtersToDisplay = removeHiddenFilters(
        filtersToStore,
        commonDateFilterMode,
        dateFiltersModeMap,
        attributeFiltersModeMap,
    );

    const filtersToDisplayInfo = useFiltersNamings(filtersToDisplay);

    return {
        areFiltersChanged,
        isCrossFiltering,
        filtersToStore,
        filtersToDisplayInfo,
    };
};

const removeIgnoredWidgetFilters = (
    filters: FilterContextItem[],
    widget: ExtendedDashboardWidget | undefined,
    displayAsLabelMap: Map<string, ObjRef>,
) => {
    if (!widget) {
        return filters;
    }

    const ignoredFilterReferences = widget.ignoreDashboardFilters ?? [];
    const ignoredFilterRefs = ignoredFilterReferences.map((reference) => {
        if (isDashboardDateFilterReference(reference)) {
            return reference.dataSet;
        }
        return reference.displayForm;
    });

    return filters.filter((filter) => {
        return !ignoredFilterRefs.some((ref) => {
            if (isDashboardDateFilter(filter)) {
                return areObjRefsEqual(filter.dateFilter.dataSet!, ref);
            }
            const displayAsLabel = filter.attributeFilter.localIdentifier
                ? displayAsLabelMap.get(filter.attributeFilter.localIdentifier)
                : undefined;
            return (
                areObjRefsEqual(filter.attributeFilter.displayForm, ref) ||
                areObjRefsEqual(displayAsLabel, ref)
            );
        });
    });
};

const removeCrossFilteringFilters = (
    filters: FilterContextItem[],
    crossFilteringItems: ICrossFilteringItem[],
) => {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap(
        (item) => item.filterLocalIdentifiers,
    );

    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            return !crossFilteringFilterLocalIdentifiers.includes(filter.attributeFilter.localIdentifier);
        }

        return true;
    });
};

const removeHiddenFilters = (
    filters: FilterContextItem[],
    commonDateFilterMode: DashboardDateFilterConfigMode,
    dateFiltersModeMap: Map<string, DashboardDateFilterConfigMode>,
    attributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>,
) => {
    return filters.filter((filter) => {
        if (isDashboardCommonDateFilter(filter)) {
            return commonDateFilterMode !== DashboardDateFilterConfigModeValues.HIDDEN;
        } else if (isDashboardDateFilter(filter) && filter.dateFilter.localIdentifier) {
            const mode = dateFiltersModeMap.get(filter.dateFilter.localIdentifier);
            return mode !== DashboardDateFilterConfigModeValues.HIDDEN;
        } else if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            const mode = attributeFiltersModeMap.get(filter.attributeFilter.localIdentifier);
            return mode !== DashboardAttributeFilterConfigModeValues.HIDDEN;
        }

        return true;
    });
};
