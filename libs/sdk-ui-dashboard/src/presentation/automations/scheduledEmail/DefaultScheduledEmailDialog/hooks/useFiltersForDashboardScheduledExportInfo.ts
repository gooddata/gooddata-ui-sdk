// (C) 2024-2026 GoodData Corporation

import { compact } from "lodash-es";

import {
    type DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterConfigModeValues,
    type DashboardDateFilterConfigMode,
    DashboardDateFilterConfigModeValues,
    type FilterContextItem,
    dashboardAttributeFilterItemLocalIdentifier,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";
import { type DateFilterOption } from "@gooddata/sdk-ui-filters";

import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { useFiltersNamings } from "../../../shared/hooks/useFiltersNamings.js";

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
    const { commonDateFilterMode, dateFiltersModeMap, attributeFiltersModeMap } =
        useScheduledEmailDialogContext();
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
        } else if (isDashboardAttributeFilterItem(filter)) {
            const localIdentifier = dashboardAttributeFilterItemLocalIdentifier(filter);
            const mode = localIdentifier ? attributeFiltersModeMap.get(localIdentifier) : undefined;
            return mode !== DashboardAttributeFilterConfigModeValues.HIDDEN;
        }

        return true;
    });
};
