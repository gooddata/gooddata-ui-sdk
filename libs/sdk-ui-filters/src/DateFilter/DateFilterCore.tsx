// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import flow from "lodash/flow";
import noop from "lodash/noop";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import { Dropdown } from "@gooddata/sdk-ui-kit";
import MediaQuery from "react-responsive";
import { IExtendedDateFilterErrors, IDateFilterOptionsByType, DateFilterOption } from "./interfaces";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExclusion";
import { formatAbsoluteDate } from "./utils/Translations/DateFilterTitle";
import { DEFAULT_DATE_FORMAT } from "./constants/Platform";
import { filterVisibleDateFilterOptions, sanitizePresetIntervals } from "./utils/OptionUtils";

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

    availableGranularities: DateFilterGranularity[];

    isEditMode: boolean;
    locale?: string;

    customFilterName?: string;
    disabled?: boolean;

    onApplyClick: () => void;
    onCancelClick: () => void;
    onDropdownOpenChanged: (isOpen: boolean) => void;

    errors?: IExtendedDateFilterErrors;
}

export const verifyDateFormat = (dateFormat: string): string => {
    try {
        // Try to format the current date to verify if dateFormat is a valid format.
        formatAbsoluteDate(new Date(), dateFormat);
        return dateFormat;
    } catch {
        // If an error occurs, then dateFormat is invalid and the default format should be used instead. Also, a warning is written in the console.
        // eslint-disable-next-line no-console
        console.warn(
            `Unsupported date format ${dateFormat}, the default format ${DEFAULT_DATE_FORMAT} is used instead.`,
        );
        return DEFAULT_DATE_FORMAT;
    }
};

export const DateFilterCore: React.FC<IDateFilterCoreProps> = ({
    originalSelectedFilterOption,
    originalExcludeCurrentPeriod,
    onDropdownOpenChanged,
    customFilterName,
    dateFormat,
    disabled,
    locale,
    filterOptions,
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
                            dateFormat={verifiedDateFormat}
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
                                ".DayPicker-Day", // absolute range picker calendar items
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
                                />
                            )}
                        />
                    );
                }}
            </MediaQuery>
        </IntlWrapper>
    );
};
