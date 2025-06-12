// (C) 2021-2025 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import {
    DateFilter,
    getLocalizedIcuDateFormatPattern,
    IDateFilterProps,
    IFilterConfigurationProps,
} from "@gooddata/sdk-ui-filters";
import {
    areObjRefsEqual,
    DashboardDateFilterConfigModeValues,
    DateFilterGranularity,
} from "@gooddata/sdk-model";

import { dateFilterOptionToDashboardDateFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";

import { IDashboardDateFilterProps } from "./types.js";
import {
    selectBackendCapabilities,
    selectCatalogDateDatasets,
    selectDashboardFiltersApplyMode,
    selectEnableDashboardFiltersApplyModes,
    selectIsInEditMode,
    selectLocale,
    selectSettings,
    selectWeekStart,
    useDashboardSelector,
} from "../../../model/index.js";
import { getVisibilityIcon } from "../utils.js";
import { DateFilterConfigurationBody } from "./configuration/DateFilterConfigurationBody.js";
import { useCurrentDateFilterConfig } from "../../dragAndDrop/index.js";

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
    const filtersApplyMode = useDashboardSelector(selectDashboardFiltersApplyMode);
    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);
    const {
        filter,
        workingFilter,
        onFilterChanged,
        config,
        readonly,
        autoOpen,
        ButtonComponent,
        overlayPositionType,
    } = props;

    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    let defaultDateFilterName: string;
    if (filter?.dateFilter.dataSet) {
        const dateDataSetName = allDateDatasets.find((ds) =>
            areObjRefsEqual(ds.dataSet.ref, filter?.dateFilter.dataSet),
        )?.dataSet?.title;
        defaultDateFilterName = config.customFilterName ?? dateDataSetName ?? "";
    } else {
        defaultDateFilterName =
            config.customFilterName ?? intl.formatMessage({ id: "dateFilterDropdown.title" });
    }
    const { title, mode } = useCurrentDateFilterConfig(filter?.dateFilter.dataSet, defaultDateFilterName);
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
    const { dateFilterOption: workingFilterOption, excludeCurrentPeriod: workingExcludeCurrentPeriod } =
        useMemo(
            () =>
                matchDateFilterToDateFilterOptionWithPreference(
                    workingFilter,
                    config.dateFilterOptions,
                    lastSelectedOptionId,
                ),
            [workingFilter, config.dateFilterOptions, lastSelectedOptionId],
        );
    const onApply = useCallback<IDateFilterProps["onApply"]>(
        (option, exclude) => {
            setLastSelectedOptionId(option.localIdentifier);
            onFilterChanged(
                dateFilterOptionToDashboardDateFilter(
                    option,
                    exclude,
                    filter?.dateFilter.dataSet,
                    filter?.dateFilter.localIdentifier,
                ),
                option.localIdentifier,
            );
        },
        [onFilterChanged, filter?.dateFilter.dataSet, filter?.dateFilter.localIdentifier],
    );
    const onSelect = useCallback<NonNullable<IDateFilterProps["onSelect"]>>(
        (option, exclude) => {
            setLastSelectedOptionId(option.localIdentifier);
            onFilterChanged(
                dateFilterOptionToDashboardDateFilter(
                    option,
                    exclude,
                    filter?.dateFilter.dataSet,
                    filter?.dateFilter.localIdentifier,
                ),
                option.localIdentifier,
                true,
            );
        },
        [onFilterChanged, filter?.dateFilter.dataSet, filter?.dateFilter.localIdentifier],
    );
    const dateFormat = settings.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings.responsiveUiDateFormat;

    const visibilityIcon = getVisibilityIcon(
        mode,
        isInEditMode,
        !!capabilities.supportsHiddenAndLockedFiltersOnUI,
        intl,
    );

    const hoursMinutesGranularities: DateFilterGranularity[] = ["GDC.time.minute", "GDC.time.hour"];
    const hasHoursMinutesGranularities = hoursMinutesGranularities.every((granularity) =>
        config.availableGranularities.includes(granularity),
    );

    const isTimeForAbsoluteRangeEnabled =
        !!capabilities.supportsTimeGranularities && hasHoursMinutesGranularities;

    const isConfigurationEnabled =
        isInEditMode &&
        (!!capabilities.supportsHiddenAndLockedFiltersOnUI || !!capabilities.supportsMultipleDateFilters);

    const FilterConfigurationComponent = useMemo(() => {
        return function ElementsSelect(props: IFilterConfigurationProps) {
            return (
                <DateFilterConfigurationBody
                    {...props}
                    intl={intl}
                    dateDataSet={filter?.dateFilter.dataSet}
                    defaultDateFilterName={defaultDateFilterName}
                />
            );
        };
    }, [intl, filter?.dateFilter.dataSet, defaultDateFilterName]);

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            workingExcludeCurrentPeriod={
                enableDashboardFiltersApplyModes ? workingExcludeCurrentPeriod : undefined
            }
            workingSelectedFilterOption={enableDashboardFiltersApplyModes ? workingFilterOption : undefined}
            dateFilterMode={
                readonly
                    ? DashboardDateFilterConfigModeValues.READONLY
                    : DashboardDateFilterConfigModeValues.ACTIVE
            }
            filterOptions={config.dateFilterOptions}
            availableGranularities={config.availableGranularities}
            customFilterName={title}
            onApply={onApply}
            onSelect={enableDashboardFiltersApplyModes ? onSelect : undefined}
            dateFormat={dateFormat}
            locale={locale}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
            isEditMode={isInEditMode}
            openOnInit={autoOpen}
            weekStart={weekStart}
            customIcon={visibilityIcon}
            showDropDownHeaderMessage={!filter?.dateFilter.dataSet}
            FilterConfigurationComponent={isConfigurationEnabled ? FilterConfigurationComponent : undefined}
            withoutApply={filtersApplyMode.mode === "ALL_AT_ONCE" && enableDashboardFiltersApplyModes}
            enableDashboardFiltersApplyModes={enableDashboardFiltersApplyModes}
            ButtonComponent={ButtonComponent}
            overlayPositionType={overlayPositionType}
        />
    );
};
