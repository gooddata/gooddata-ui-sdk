// (C) 2024-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    type FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";
import { type DateFilterOption } from "@gooddata/sdk-ui-filters";

import { useFiltersNamings } from "../../../../_staging/sharedHooks/useFiltersNamings.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectEffectiveAttributeFiltersModeMap } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEffectiveDateFilterMode } from "../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectEffectiveDateFiltersModeMap } from "../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";

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
