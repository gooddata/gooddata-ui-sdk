// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import { type DayPickerProps } from "react-day-picker";

import {
    DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES,
    type DateFilterGranularity,
    type WeekStart,
} from "@gooddata/sdk-model";
import { type IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

import { DATE_FILTER_ABSOLUTE_GRANULARITY_TAB_ID } from "../accessibility/elementId.js";
import { DateRangePicker } from "../DateRangePicker/DateRangePicker.js";
import { type IDateRange } from "../DateRangePicker/types.js";
import { GranularityTabs } from "../GranularityTabs.js";
import { type DateFilterOption, type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";
import { PeriodRangePicker } from "../PeriodRangePicker/PeriodRangePicker.js";
import { type IPeriodRange, type PeriodRangePickerGranularity } from "../PeriodRangePicker/types.js";

import {
    dateFilterValueToDateRange,
    dateRangeToDateFilterValue,
    periodRangeToDateFilterValue,
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
    selectedFilterOption: IUiAbsoluteDateFilterForm;
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
     * Enables Day/Week/Month/Quarter/Year granularity switching.
     *
     * @remarks
     * When false (the default), this component renders without the granularity tabs - regardless of
     * what `availableGranularities` is set to, or what `granularity` flows in through
     * `selectedFilterOption`.
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
}

const dayPickerProps: DayPickerProps = {
    mode: "range",
    weekStartsOn: 0, // Sunday, regardless of locale
};

const isPeriodPickerGranularity = (
    granularity: DateFilterGranularity,
): granularity is PeriodRangePickerGranularity =>
    DEFAULT_ABSOLUTE_DATE_FILTER_GRANULARITIES.includes(granularity);

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
    isGranularityEnabled = false,
    availableGranularities,
    accessibilityConfig,
}: IAbsoluteDateFilterFormProps) {
    const selectedGranularity = selectedFilterOption.granularity ?? availableGranularities[0];
    const showGranularityTabs = isGranularityEnabled && availableGranularities.length > 0;

    const handleRangeChange = (range: IDateRange): void => {
        onSelectedFilterOptionChange({
            ...selectedFilterOption,
            ...dateRangeToDateFilterValue(
                range,
                selectedFilterOption.localIdentifier,
                isTimeEnabled,
                selectedFilterOption.emptyValueHandling,
                isSecondsEnabled,
            ),
        });
    };

    const handlePeriodRangeChange = (range: IPeriodRange): void => {
        onSelectedFilterOptionChange({
            ...selectedFilterOption,
            ...periodRangeToDateFilterValue({
                range,
                localIdentifier: selectedFilterOption.localIdentifier,
                isTimeForAbsoluteRangeEnabled: isTimeEnabled,
                emptyValueHandling: selectedFilterOption.emptyValueHandling,
                isSecondsForAbsoluteRangeEnabled: isSecondsEnabled,
            }),
        });
    };

    const handleGranularityChange = (granularity: DateFilterGranularity): void => {
        onSelectedFilterOptionChange({
            ...selectedFilterOption,
            ...(selectedGranularity === granularity ? {} : { from: undefined, to: undefined }),
            granularity,
        });
    };

    // TODO MC-5322: time granularity is not supported in the new picker yet - the hour/minute/second can't be
    // modified, so the selected range always spans the whole day (00:00-23:59[:59] once time is enabled).
    // This will be added as part of MC-5322.
    const picker =
        showGranularityTabs && isPeriodPickerGranularity(selectedGranularity) ? (
            <PeriodRangePicker
                key={selectedGranularity}
                granularity={selectedGranularity}
                range={{ from: selectedFilterOption.from, to: selectedFilterOption.to }}
                onRangeChange={handlePeriodRangeChange}
                isMobile={isMobile}
                weekStart={weekStart}
                withoutApply={withoutApply}
                submitForm={submitForm}
            />
        ) : (
            <DateRangePicker
                dateFormat={dateFormat}
                onRangeChange={handleRangeChange}
                range={dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled, isSecondsEnabled)}
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
                <GranularityTabs
                    availableGranularities={availableGranularities}
                    selectedGranularity={selectedGranularity}
                    onSelectedGranularityChange={handleGranularityChange}
                    accessibilityConfig={{ ariaControls: accessibilityConfig?.id }}
                    className="gd-absolute-filter-form-granularity-tabs s-absolute-filter-form-granularity-tabs"
                    selectedTabId={DATE_FILTER_ABSOLUTE_GRANULARITY_TAB_ID}
                />
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
