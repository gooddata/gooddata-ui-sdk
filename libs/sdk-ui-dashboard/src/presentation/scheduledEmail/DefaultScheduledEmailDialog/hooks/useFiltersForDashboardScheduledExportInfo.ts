// (C) 2024 GoodData Corporation
import {
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";
import { DateFilterOption } from "@gooddata/sdk-ui-filters";

import { useFiltersNamings } from "../../../../_staging/sharedHooks/useFiltersNamings.js";
import {
    selectEffectiveAttributeFiltersModeMap,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFiltersModeMap,
    useDashboardSelector,
} from "../../../../model/index.js";
import compact from "lodash/compact.js";

export interface IAttachmentFilterInfo {
    id: string;
    title: string;
    subtitle: string;
    attributeFilterValues?: (string | null)[];
    isAttributeFilterNegative?: boolean;
    dateFilterOption?: DateFilterOption;
}

interface IUseFiltersForDashboardScheduledExportInfoProps {
    /**
     * Effective filters - original stored filters or current effective dashboard filters (without cross-filtering).
     */
    effectiveFilters?: FilterContextItem[];
}

export const useFiltersForDashboardScheduledExportInfo = ({
    effectiveFilters = [],
}: IUseFiltersForDashboardScheduledExportInfoProps) => {
    // Remove hidden dashboard filters, we don't want to display them.
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);
    const filtersToDisplay = removeHiddenFilters(
        effectiveFilters,
        commonDateFilterMode,
        dateFiltersModeMap,
        attributeFiltersModeMap,
    );

    return compact(useFiltersNamings(filtersToDisplay));
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
