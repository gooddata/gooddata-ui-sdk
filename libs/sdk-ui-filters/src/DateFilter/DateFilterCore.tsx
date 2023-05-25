// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import flow from "lodash/flow.js";
import noop from "lodash/noop.js";
import DefaultMediaQuery from "react-responsive";
import { defaultImport } from "default-import";
import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import { IExtendedDateFilterErrors, IDateFilterOptionsByType, DateFilterOption } from "./interfaces/index.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants/index.js";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody.js";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { DEFAULT_DATE_FORMAT, TIME_FORMAT_WITH_SEPARATOR } from "./constants/Platform.js";
import { filterVisibleDateFilterOptions, sanitizePresetIntervals } from "./utils/OptionUtils.js";
import format from "date-fns/format/index.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/49189#issuecomment-1137802865
const MediaQuery = defaultImport(DefaultMediaQuery);

export interface IDateFilterCoreProps {
    dateFormat: string;
    filterOptions: IDateFilterOptionsByType;
    /**
     * Filter option currently selected, it would be applied on Apply click.
     */
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    /**
     * Filter option selected before the filter dialog was opened.
     */
    originalSelectedFilterOption: DateFilterOption;

    excludeCurrentPeriod: boolean;
    originalExcludeCurrentPeriod: boolean;
    isExcludeCurrentPeriodEnabled: boolean;
    onExcludeCurrentPeriodChange: (isExcluded: boolean) => void;
    isTimeForAbsoluteRangeEnabled: boolean;

    availableGranularities: DateFilterGranularity[];

    isEditMode: boolean;
    locale?: string;

    customFilterName?: string;
    disabled?: boolean;

    onApplyClick: () => void;
    onCancelClick: () => void;
    onDropdownOpenChanged: (isOpen: boolean) => void;

    errors?: IExtendedDateFilterErrors;

    weekStart?: WeekStart;
}

export const verifyDateFormat = (dateFormat: string): string => {
    try {
        // Try to format the current date to verify if dateFormat is a valid format.
        format(new Date(), dateFormat);
        return dateFormat;
    } catch {
        // If an error occurs, then dateFormat is invalid and the default format should be used instead. Also, a warning is written in the console.
        console.warn(
            `Unsupported date format ${dateFormat}, the default format ${DEFAULT_DATE_FORMAT} is used instead.`,
        );
        return DEFAULT_DATE_FORMAT;
    }
};

const adjustDateFormatForDisplay = (dateFormat: string, isTimeForAbsoluteRangeEnabled: boolean = false) =>
    isTimeForAbsoluteRangeEnabled ? dateFormat + TIME_FORMAT_WITH_SEPARATOR : dateFormat;

export const DateFilterCore: React.FC<IDateFilterCoreProps> = ({
    originalSelectedFilterOption,
    originalExcludeCurrentPeriod,
    onDropdownOpenChanged,
    customFilterName,
    dateFormat,
    disabled,
    locale,
    filterOptions,
    isTimeForAbsoluteRangeEnabled,
    weekStart,
    ...dropdownBodyProps
}) => {
    const verifiedDateFormat = verifyDateFormat(dateFormat);
    const filteredFilterOptions = useMemo(() => {
        return flow(filterVisibleDateFilterOptions, sanitizePresetIntervals)(filterOptions);
    }, [filterOptions]);
    return (
        <IntlWrapper locale={locale || "en-US"}>
            <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                {(isMobile) => {
                    const dateFilterButton = (isOpen: boolean = false) => (
                        <DateFilterButtonLocalized
                            disabled={disabled}
                            isMobile={isMobile}
                            isOpen={isOpen}
                            dateFilterOption={applyExcludeCurrentPeriod(
                                originalSelectedFilterOption,
                                originalExcludeCurrentPeriod,
                            )}
                            dateFormat={adjustDateFormatForDisplay(
                                verifiedDateFormat,
                                isTimeForAbsoluteRangeEnabled,
                            )}
                            customFilterName={customFilterName}
                        />
                    );
                    return (
                        <Dropdown
                            closeOnParentScroll={true}
                            closeOnMouseDrag={true}
                            closeOnOutsideClick={true}
                            enableEventPropagation={true}
                            alignPoints={[
                                { align: "bl tl" },
                                { align: "tr tl" },
                                { align: "br tr", offset: { x: -11 } },
                                { align: "tr tl", offset: { x: 0, y: -100 } },
                                { align: "tr tl", offset: { x: 0, y: -50 } },
                            ]}
                            onOpenStateChanged={onDropdownOpenChanged}
                            renderButton={({ isOpen, toggleDropdown }) => (
                                <span onClick={disabled ? noop : toggleDropdown}>
                                    {dateFilterButton(isOpen)}
                                </span>
                            )}
                            ignoreClicksOnByClass={[
                                ".s-do-not-close-dropdown-on-click",
                                ".rdp-day", // absolute range picker calendar items
                            ]}
                            renderBody={({ closeDropdown }) => (
                                // Dropdown component uses React.Children.map and adds special props to this component
                                // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children
                                <DateFilterBody
                                    {...dropdownBodyProps}
                                    filterOptions={filteredFilterOptions}
                                    isMobile={isMobile}
                                    closeDropdown={closeDropdown}
                                    dateFilterButton={dateFilterButton()}
                                    dateFormat={verifiedDateFormat}
                                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                                    weekStart={weekStart}
                                />
                            )}
                        />
                    );
                }}
            </MediaQuery>
        </IntlWrapper>
    );
};
