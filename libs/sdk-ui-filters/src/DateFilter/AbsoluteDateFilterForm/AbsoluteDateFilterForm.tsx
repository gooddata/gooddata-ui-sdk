// (C) 2007-2026 GoodData Corporation

import { type ReactNode, type RefObject } from "react";

import { type DayPickerProps } from "react-day-picker";

import { type DateFilterGranularity, type WeekStart } from "@gooddata/sdk-model";
import { type IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

import { DATE_FILTER_ABSOLUTE_GRANULARITY_TAB_ID } from "../accessibility/elementId.js";
import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import { type IDateRange } from "../DateRangePicker/types.js";
import { GranularityTabs } from "../GranularityTabs.js";
import {
    type DateFilterOption,
    type IUiAbsoluteDateFilterForm,
    isUiAbsoluteGranularityDateFilterForm,
} from "../interfaces/index.js";
import { PeriodRangePicker } from "../PeriodRangePicker/PeriodRangePicker.js";
import { type IPeriodRange } from "../PeriodRangePicker/types.js";
import { WeekRangeList } from "../WeekRangeList/WeekRangeList.js";

import {
    type AbsoluteFormOption,
    dateFilterValueToDateRange,
    dateFilterValueToPeriodRange,
    dateRangeToDateFilterValue,
    getAbsoluteFormTab,
    periodRangeToAbsoluteGranularityForm,
    periodRangeToDateFilterValue,
    switchAbsoluteFormTab,
    tabToDatePeriodGranularity,
} from "./conversions.js";

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormAccessibilityConfig extends IAccessibilityConfigBase {
    /**
     * Id applied to the picker panel, wired to the granularity tabs' `aria-controls`.
     */
    id?: string;
}

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormProps {
    dateFormat: string;
    selectedFilterOption: AbsoluteFormOption;
    isMobile: boolean;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    weekStart?: WeekStart;
    shouldOverlayDatePicker?: boolean;
    withoutApply?: boolean;
    submitForm: () => void;
    customRangeHint?: ReactNode;
    /**
     * Reports whether the `PeriodRangePicker` or `WeekRangeList` branch currently forms a submittable range -
     * see `IPeriodRangePickerProps.onValidityChange`. Not called for the classic `DateRangePicker` branch.
     */
    onPeriodRangeValidityChange?: (isValid: boolean) => void;
    /**
     * Enables Day/Week/Month/Quarter/Year granularity switching.
     *
     * @remarks
     * When false (the default), this component renders without the granularity tabs - regardless of
     * what `availableGranularities` is set to, or what `granularity` flows in through
     * `selectedFilterOption`. An option of whole periods is then not shown and the day picker stays empty.
     */
    isGranularityEnabled?: boolean;
    /**
     * Available granularities for this absolute date filter.
     */
    availableGranularities: DateFilterGranularity[];
    /**
     * Accessibility configuration for the absolute date filter form.
     */
    accessibilityConfig?: IAbsoluteDateFilterFormAccessibilityConfig;
    /**
     * Ref for the granularity tabs' wrapping element - used for keyboard navigation focus management.
     * Only relevant while {@link IAbsoluteDateFilterFormProps.isGranularityEnabled} renders the tabs.
     */
    granularityTabsRef?: RefObject<HTMLDivElement | null>;
}

const dayPickerProps: DayPickerProps = {
    mode: "range",
    weekStartsOn: 0, // Sunday, regardless of locale
};

const EMPTY_DATE_RANGE: IDateRange = { from: undefined, to: undefined };

/**
 * @internal
 */
export function AbsoluteDateFilterForm({
    dateFormat,
    isMobile,
    selectedFilterOption,
    isTimeEnabled,
    isSecondsEnabled = false,
    weekStart,
    shouldOverlayDatePicker,
    withoutApply,
    onSelectedFilterOptionChange,
    submitForm,
    customRangeHint,
    onPeriodRangeValidityChange,
    isGranularityEnabled = false,
    availableGranularities,
    accessibilityConfig,
    granularityTabsRef,
}: IAbsoluteDateFilterFormProps) {
    const selectedGranularity = getAbsoluteFormTab(selectedFilterOption);
    const periodGranularity = tabToDatePeriodGranularity(selectedGranularity);
    const showGranularityTabs = isGranularityEnabled && availableGranularities.length > 0;
    const isPeriodOption = isUiAbsoluteGranularityDateFilterForm(selectedFilterOption);

    // A range replacing whole periods keeps their name and visibility, so the option matches the configured one.
    const withPeriodIdentity = <T extends AbsoluteFormOption>(option: T): T => ({
        ...option,
        ...(selectedFilterOption.name === undefined ? {} : { name: selectedFilterOption.name }),
        visible: selectedFilterOption.visible,
    });

    const toDayOption = (days: IUiAbsoluteDateFilterForm): IUiAbsoluteDateFilterForm =>
        isPeriodOption ? withPeriodIdentity(days) : { ...selectedFilterOption, ...days };

    const handleRangeChange = (range: IDateRange): void => {
        onSelectedFilterOptionChange(
            toDayOption(
                dateRangeToDateFilterValue(
                    range,
                    selectedFilterOption.localIdentifier,
                    isTimeEnabled,
                    selectedFilterOption.emptyValueHandling,
                    isSecondsEnabled,
                ),
            ),
        );
    };

    const handlePeriodRangeChange = (range: IPeriodRange): void => {
        onSelectedFilterOptionChange(
            periodGranularity
                ? withPeriodIdentity(
                      periodRangeToAbsoluteGranularityForm(
                          range,
                          periodGranularity,
                          selectedFilterOption.localIdentifier,
                          selectedFilterOption.emptyValueHandling,
                      ),
                  )
                : toDayOption(
                      periodRangeToDateFilterValue({
                          range,
                          localIdentifier: selectedFilterOption.localIdentifier,
                          isTimeForAbsoluteRangeEnabled: isTimeEnabled,
                          emptyValueHandling: selectedFilterOption.emptyValueHandling,
                          isSecondsForAbsoluteRangeEnabled: isSecondsEnabled,
                      }),
                  ),
        );
    };

    const handleGranularityChange = (granularity: DateFilterGranularity): void => {
        if (granularity !== selectedGranularity) {
            onSelectedFilterOptionChange(switchAbsoluteFormTab(selectedFilterOption, granularity));
        }
    };

    // TODO MC-5322: time granularity is not supported in the new picker yet - the hour/minute/second can't be
    // modified, so the selected range always spans the whole day (00:00-23:59[:59] once time is enabled).
    // This will be added as part of MC-5322.
    const isPeriodPicker = isGranularityEnabled && (showGranularityTabs || isPeriodOption);
    const picker =
        isPeriodPicker && periodGranularity === "GDC.time.week" ? (
            <WeekRangeList
                range={dateFilterValueToPeriodRange(selectedFilterOption)}
                onRangeChange={handlePeriodRangeChange}
                weekStart={weekStart}
                dateFormat={dateFormat}
                isMobile={isMobile}
                customRangeHint={customRangeHint}
                onValidityChange={onPeriodRangeValidityChange}
                withoutApply={withoutApply}
                submitForm={submitForm}
            />
        ) : isPeriodPicker ? (
            <PeriodRangePicker
                key={selectedGranularity}
                granularity={periodGranularity ?? "GDC.time.date"}
                range={dateFilterValueToPeriodRange(selectedFilterOption)}
                onRangeChange={handlePeriodRangeChange}
                isMobile={isMobile}
                weekStart={weekStart}
                withoutApply={withoutApply}
                submitForm={submitForm}
                dateFormat={dateFormat}
                customRangeHint={customRangeHint}
                onValidityChange={onPeriodRangeValidityChange}
            />
        ) : (
            <DateRangePicker
                dateFormat={dateFormat}
                onRangeChange={handleRangeChange}
                range={
                    isPeriodOption
                        ? EMPTY_DATE_RANGE
                        : dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled, isSecondsEnabled)
                }
                isMobile={isMobile}
                dayPickerProps={dayPickerProps}
                isTimeEnabled={isTimeEnabled}
                isSecondsEnabled={isSecondsEnabled}
                weekStart={weekStart}
                shouldOverlayDatePicker={shouldOverlayDatePicker}
                submitForm={submitForm}
                withoutApply={withoutApply}
                customRangeHint={customRangeHint}
            />
        );

    return (
        <>
            {showGranularityTabs ? (
                <div ref={granularityTabsRef}>
                    <GranularityTabs
                        availableGranularities={availableGranularities}
                        selectedGranularity={selectedGranularity}
                        onSelectedGranularityChange={handleGranularityChange}
                        accessibilityConfig={{ ariaControls: accessibilityConfig?.id }}
                        className="gd-absolute-filter-form-granularity-tabs s-absolute-filter-form-granularity-tabs"
                        selectedTabId={DATE_FILTER_ABSOLUTE_GRANULARITY_TAB_ID}
                    />
                </div>
            ) : null}
            {showGranularityTabs ? (
                <div
                    id={accessibilityConfig?.id}
                    role="tabpanel"
                    aria-labelledby={DATE_FILTER_ABSOLUTE_GRANULARITY_TAB_ID}
                >
                    {picker}
                </div>
            ) : (
                picker
            )}
        </>
    );
}
