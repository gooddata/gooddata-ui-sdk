// (C) 2021-2023 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import {
    DateFilter,
    getLocalizedIcuDateFormatPattern,
    IDateFilterProps,
    IFilterConfigurationProps,
} from "@gooddata/sdk-ui-filters";
import { DashboardDateFilterConfigModeValues } from "@gooddata/sdk-model";

import { dateFilterOptionToDashboardDateFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";

import { IDashboardDateFilterProps } from "./types.js";
import {
    selectBackendCapabilities,
    selectIsInEditMode,
    selectLocale,
    selectSettings,
    selectWeekStart,
    selectDateFilterConfigOverrides,
    useDashboardSelector,
} from "../../../model/index.js";
import { getVisibilityIcon } from "../utils.js";
import { DateFilterConfigurationBody } from "./DateFilterConfigurationBody.js";

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's DateFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardDateFilter = (props: IDashboardDateFilterProps): JSX.Element => {
    const intl = useIntl();
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const locale = useDashboardSelector(selectLocale);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const weekStart = useDashboardSelector(selectWeekStart);
    const filterConfig = useDashboardSelector(selectDateFilterConfigOverrides);
    const { filter, onFilterChanged, config, readonly, autoOpen } = props;
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
            onFilterChanged(
                dateFilterOptionToDashboardDateFilter(option, exclude, filter?.dateFilter.dataSet),
                option.localIdentifier,
            );
        },
        [onFilterChanged, filter?.dateFilter.dataSet],
    );
    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;

    const visibilityIcon = getVisibilityIcon(
        filterConfig?.mode,
        isInEditMode,
        !!capabilities.supportsHiddenAndLockedFiltersOnUI,
        intl,
    );

    const isConfigurationEnabled = isInEditMode && !!capabilities.supportsHiddenAndLockedFiltersOnUI;

    const FilterConfigurationComponent = useMemo(() => {
        return function ElementsSelect(props: IFilterConfigurationProps) {
            return <DateFilterConfigurationBody {...props} intl={intl} />;
        };
    }, [intl]);

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            dateFilterMode={
                readonly
                    ? DashboardDateFilterConfigModeValues.READONLY
                    : DashboardDateFilterConfigModeValues.ACTIVE
            }
            filterOptions={config.dateFilterOptions}
            availableGranularities={config.availableGranularities}
            customFilterName={config.customFilterName}
            onApply={onApply}
            dateFormat={dateFormat}
            locale={locale}
            isTimeForAbsoluteRangeEnabled={!!capabilities.supportsTimeGranularities}
            isEditMode={isInEditMode}
            openOnInit={autoOpen}
            weekStart={weekStart}
            customIcon={visibilityIcon}
            showDropDownHeaderMessage={!filter?.dateFilter.dataSet}
            FilterConfigurationComponent={isConfigurationEnabled ? FilterConfigurationComponent : undefined}
        />
    );
};
