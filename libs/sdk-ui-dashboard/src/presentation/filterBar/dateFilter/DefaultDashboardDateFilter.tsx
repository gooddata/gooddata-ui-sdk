// (C) 2021-2023 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { DateFilter, getLocalizedIcuDateFormatPattern, IDateFilterProps } from "@gooddata/sdk-ui-filters";

import { dateFilterOptionToDashboardDateFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";

import { IDashboardDateFilterProps } from "./types.js";
import {
    selectBackendCapabilities,
    selectIsInEditMode,
    selectLocale,
    selectSettings,
    selectWeekStart,
    useDashboardSelector,
} from "../../../model/index.js";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's DateFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardDateFilter = (props: IDashboardDateFilterProps): JSX.Element => {
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const locale = useDashboardSelector(selectLocale);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const weekStart = useDashboardSelector(selectWeekStart);
    const { filter, onFilterChanged, config, readonly } = props;
    const [lastSelectedOptionId, setLastSelectedOptionId] = useState("");
    const { dateFilterOption, excludeCurrentPeriod } = useMemo(
        () =>
            matchDateFilterToDateFilterOptionWithPreference(
                filter,
                config.dateFilterOptions,
                lastSelectedOptionId,
            ),
        [filter, config.dateFilterOptions, lastSelectedOptionId],
    );
    const onApply = useCallback<IDateFilterProps["onApply"]>(
        (option, exclude) => {
            setLastSelectedOptionId(option.localIdentifier);
            onFilterChanged(dateFilterOptionToDashboardDateFilter(option, exclude), option.localIdentifier);
        },
        [onFilterChanged],
    );
    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            dateFilterMode={readonly ? "readonly" : "active"}
            filterOptions={config.dateFilterOptions}
            availableGranularities={config.availableGranularities}
            customFilterName={config.customFilterName}
            onApply={onApply}
            dateFormat={dateFormat}
            locale={locale}
            isTimeForAbsoluteRangeEnabled={!!capabilities.supportsTimeGranularities}
            isEditMode={isInEditMode}
            weekStart={weekStart}
        />
    );
};
