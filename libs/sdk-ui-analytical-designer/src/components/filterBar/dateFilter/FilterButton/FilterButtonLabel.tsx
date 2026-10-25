// (C) 2007-2026 GoodData Corporation

import { useRef } from "react";

import classNames from "classnames";

import { isAllTimeDateFilterOption } from "@gooddata/sdk-model";

import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";
import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

import { AdditionalFilterDetails } from "./AdditionalFilterDetails.js";
import { DatasetTitle } from "./DatasetTitle.js";
import { SelectedPresetName } from "./SelectedPresetName.js";
import { isTimeComparisonConfigured } from "./TimeComparison.js";

export interface IFilterButtonLabelProps {
    filter: IDateFilterOption;
    datasetTitle: string;
    timeComparisonSummary: IOverTimeComparisonSummary | null;
    additionalDateFilterLabels: IAdditionalDateFilterLabel[];
    dateFormat: string;
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
    isDragged?: boolean;
    isTimeForAbsoluteRangeEnabled: boolean;
    isSecondsForAbsoluteRangeEnabled?: boolean;
}

const adjustDateFormatForDisplay = (
    dateFormat: string,
    isTimeForAbsoluteRangeEnabled = false,
    isSecondsForAbsoluteRangeEnabled = false,
): string => {
    if (!isTimeForAbsoluteRangeEnabled) {
        return dateFormat;
    }
    return isSecondsForAbsoluteRangeEnabled ? `${dateFormat}, HH:mm:ss` : `${dateFormat}, HH:mm`;
};

export function FilterButtonLabel({
    filter,
    datasetTitle,
    timeComparisonSummary,
    additionalDateFilterLabels,
    dateFormat,
    emptyDateValuesFilterMode,
    isDragged,
    isTimeForAbsoluteRangeEnabled,
    isSecondsForAbsoluteRangeEnabled,
}: IFilterButtonLabelProps) {
    const secondLineRef = useRef<HTMLDivElement>(null);
    const buttonTooltip = secondLineRef?.current?.innerText?.replace(/\n/g, "");
    const hasTimeComparisonConfigured = isTimeComparisonConfigured(timeComparisonSummary);
    const hasAdditionalFiltersConfigured = additionalDateFilterLabels.length > 0;
    const isPresetOnFirstLine = hasTimeComparisonConfigured || hasAdditionalFiltersConfigured;
    const isAllTime = isAllTimeDateFilterOption(filter.filterOption);
    const hasEmptyValuesFilterApplied =
        emptyDateValuesFilterMode === "only" || emptyDateValuesFilterMode === "exclude";
    const isInDefaultState = isAllTime && !hasTimeComparisonConfigured && !hasEmptyValuesFilterApplied;

    const secondLineClassNames = classNames(
        "adi-filter-selection",
        "s-global-attribute-filter-selection",
        "s-global-filter-label-bottom",
        "adi-filter-button-bottom-line",
        {
            "adi-filter-all-selected": isInDefaultState,
        },
    );

    const displayDateFormat = adjustDateFormatForDisplay(
        dateFormat,
        isTimeForAbsoluteRangeEnabled,
        isSecondsForAbsoluteRangeEnabled,
    );

    return (
        <div title={buttonTooltip}>
            <DatasetTitle title={datasetTitle} isAllTime={isAllTime} isDragged={isDragged}>
                {isPresetOnFirstLine ? (
                    <SelectedPresetName
                        isInDefaultState={isInDefaultState}
                        filter={filter}
                        dateFormat={displayDateFormat}
                        emptyDateValuesFilterMode={emptyDateValuesFilterMode}
                    />
                ) : null}
            </DatasetTitle>
            <div className={secondLineClassNames} ref={secondLineRef}>
                {isPresetOnFirstLine ? (
                    <AdditionalFilterDetails
                        timeComparisonSummary={timeComparisonSummary}
                        additionalDateFilterLabels={additionalDateFilterLabels}
                    />
                ) : (
                    <SelectedPresetName
                        isInDefaultState={isInDefaultState}
                        filter={filter}
                        dateFormat={displayDateFormat}
                        emptyDateValuesFilterMode={emptyDateValuesFilterMode}
                    />
                )}
            </div>
        </div>
    );
}
