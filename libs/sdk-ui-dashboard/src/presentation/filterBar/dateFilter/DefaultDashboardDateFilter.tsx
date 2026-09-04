// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import {
    DashboardDateFilterConfigModeValues,
    type DateFilterGranularity,
    type ICatalogDateDataset,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import {
    DateFilter,
    type IDateFilterProps,
    type IFilterConfigurationProps,
    getLocalizedIcuDateFormatPattern,
} from "@gooddata/sdk-ui-filters";

import { dateFilterOptionToDashboardDateFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { matchDateFilterToDateFilterOptionWithPreference } from "../../../_staging/dateFilterConfig/dateFilterOptionMapping.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectBackendCapabilities } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectCatalogDateDatasets } from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectActiveCalendars,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectLocale,
    selectSettings,
    selectWeekStart,
} from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { useCurrentDateFilterConfig } from "../../dragAndDrop/useCurrentDateFilterConfig.js";
import { getVisibilityIcon } from "../utils.js";

import { DateFilterConfigurationBody } from "./configuration/DateFilterConfigurationBody.js";
import { type IDashboardDateFilterProps } from "./types.js";

/**
 * Whether the date dimension relevant to the filter exposes the second-level attribute (`GDC.time.second`):
 * a dimension-scoped filter checks its own dataset, a common (dataset-less) filter checks whether any date
 * dimension has seconds enabled.
 */
function relevantDateDimensionHasSeconds(
    dateDatasets: ICatalogDateDataset[],
    dataSetRef: ObjRef | undefined,
): boolean {
    const datasetHasSeconds = (dateDataset: ICatalogDateDataset) =>
        dateDataset.dateAttributes.some((attribute) => attribute.granularity === "GDC.time.second");

    return dataSetRef
        ? dateDatasets.some((ds) => areObjRefsEqual(ds.dataSet.ref, dataSetRef) && datasetHasSeconds(ds))
        : dateDatasets.some(datasetHasSeconds);
}

/**
 * Default implementation of the date filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's DateFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export function DefaultDashboardDateFilter({
    filter,
    workingFilter,
    onFilterChanged,
    config,
    readonly,
    autoOpen,
    ButtonComponent,
    overlayPositionType,
    tabId,
    customRangeHint,
}: IDashboardDateFilterProps): ReactElement {
    const intl = useIntl();
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const locale = useDashboardSelector(selectLocale);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const weekStart = useDashboardSelector(selectWeekStart);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const activeCalendars = useDashboardSelector(selectActiveCalendars);
    // The empty-values feature (the "Empty values" preset and the include/exclude toggle) is shown only when
    // the date filter config marks the option as visible. Hiding it via the config does not strip an
    // already-set emptyValueHandling - that value is still applied to executions.
    const enableEmptyDateValues = config.dateFilterOptions.emptyValues?.visible ?? true;
    const isAbsoluteDateFilterGranularityEnabled = !!settings.enableAbsoluteDateFilterGranularity;

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
    const { title, mode } = useCurrentDateFilterConfig(
        filter?.dateFilter.dataSet,
        defaultDateFilterName,
        tabId,
    );
    const [lastSelectedOptionId, setLastSelectedOptionId] = useState("");

    const dateFilterOptions = useMemo(() => {
        if (enableEmptyDateValues) {
            return config.dateFilterOptions;
        }

        const { emptyValues: _emptyValues, ...rest } = config.dateFilterOptions;
        return rest;
    }, [config.dateFilterOptions, enableEmptyDateValues]);

    const { dateFilterOption, excludeCurrentPeriod } = useMemo(
        () =>
            matchDateFilterToDateFilterOptionWithPreference(filter, dateFilterOptions, lastSelectedOptionId),
        [filter, dateFilterOptions, lastSelectedOptionId],
    );
    const { dateFilterOption: workingFilterOption, excludeCurrentPeriod: workingExcludeCurrentPeriod } =
        useMemo(
            () =>
                matchDateFilterToDateFilterOptionWithPreference(
                    workingFilter,
                    dateFilterOptions,
                    lastSelectedOptionId,
                ),
            [workingFilter, dateFilterOptions, lastSelectedOptionId],
        );
    const onApply = useCallback<NonNullable<IDateFilterProps["onApply"]>>(
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

    // Second-level relative granularities ship in the default config but are surfaced only when the
    // enableSecondGranularities feature flag is on AND the backend supports time granularities; otherwise
    // strip them from the tabs the relative form shows.
    const availableGranularities = useMemo(
        () =>
            settings.enableSecondGranularities && capabilities.supportsTimeGranularities
                ? config.availableGranularities
                : config.availableGranularities.filter((granularity) => granularity !== "GDC.time.second"),
        [
            config.availableGranularities,
            settings.enableSecondGranularities,
            capabilities.supportsTimeGranularities,
        ],
    );

    // Seconds precision in the absolute date filter time field is offered only when the backend supports time
    // granularities, the enableSecondGranularities feature flag is on, and the relevant date dimension exposes
    // the GDC.time.second attribute. This is a stricter, dimension-aware gate than the relative form's seconds
    // tab (which follows availableGranularities); the absolute time field must not appear for a dimension that
    // has no second attribute.
    const isSecondsForAbsoluteRangeEnabled =
        isTimeForAbsoluteRangeEnabled &&
        !!settings.enableSecondGranularities &&
        relevantDateDimensionHasSeconds(allDateDatasets, filter?.dateFilter.dataSet);

    const isConfigurationEnabled =
        isInEditMode &&
        (!!capabilities.supportsHiddenAndLockedFiltersOnUI || !!capabilities.supportsMultipleDateFilters);

    const FilterConfigurationComponent = useMemo(() => {
        function ElementsSelect(props: IFilterConfigurationProps) {
            return (
                <DateFilterConfigurationBody
                    {...props}
                    intl={intl}
                    dateDataSet={filter?.dateFilter.dataSet}
                    defaultDateFilterName={defaultDateFilterName}
                />
            );
        }

        return ElementsSelect;
    }, [intl, filter?.dateFilter.dataSet, defaultDateFilterName]);

    return (
        <DateFilter
            excludeCurrentPeriod={excludeCurrentPeriod}
            selectedFilterOption={dateFilterOption}
            workingExcludeCurrentPeriod={
                isApplyAllAtOnceEnabledAndSet ? workingExcludeCurrentPeriod : undefined
            }
            workingSelectedFilterOption={isApplyAllAtOnceEnabledAndSet ? workingFilterOption : undefined}
            dateFilterMode={
                readonly
                    ? DashboardDateFilterConfigModeValues.READONLY
                    : DashboardDateFilterConfigModeValues.ACTIVE
            }
            filterOptions={dateFilterOptions}
            availableGranularities={availableGranularities}
            customFilterName={title}
            onApply={onApply}
            onSelect={isApplyAllAtOnceEnabledAndSet ? onSelect : undefined}
            dateFormat={dateFormat}
            locale={locale}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
            isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled}
            isAbsoluteDateFilterGranularityEnabled={isAbsoluteDateFilterGranularityEnabled}
            isEditMode={isInEditMode}
            openOnInit={autoOpen}
            weekStart={weekStart}
            customIcon={visibilityIcon}
            showDropDownHeaderMessage={!filter?.dateFilter.dataSet}
            FilterConfigurationComponent={isConfigurationEnabled ? FilterConfigurationComponent : undefined}
            withoutApply={isApplyAllAtOnceEnabledAndSet}
            ButtonComponent={ButtonComponent}
            overlayPositionType={overlayPositionType}
            activeCalendars={activeCalendars}
            enableEmptyDateValues={enableEmptyDateValues}
            hideDisabledExclude
            customRangeHint={customRangeHint}
        />
    );
}
