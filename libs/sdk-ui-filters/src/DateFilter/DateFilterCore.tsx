// (C) 2007-2025 GoodData Corporation
import React, { ComponentType, useCallback, useMemo, useRef, useState } from "react";

import format from "date-fns/format/index.js";
import flow from "lodash/flow.js";
import isEmpty from "lodash/isEmpty.js";
import noop from "lodash/noop.js";
import { MediaQuery } from "react-responsive";

import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";
import {
    IntlWrapper,
    ValidationContextStore,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { Dropdown, OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { DATE_FILTER_SELECTED_LIST_ITEM_ID } from "./accessibility/elementId.js";
import { createDateFilterKeyboardHandler } from "./accessibility/keyboardNavigation.js";
import { DEFAULT_DATE_FORMAT, TIME_FORMAT_WITH_SEPARATOR } from "./constants/Platform.js";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody.js";
import { IFilterConfigurationProps } from "./DateFilterBody/types.js";
import { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { DateFilterOption, IDateFilterOptionsByType, IExtendedDateFilterErrors } from "./interfaces/index.js";
import { filterVisibleDateFilterOptions, sanitizePresetIntervals } from "./utils/OptionUtils.js";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { MediaQueries } from "../constants/index.js";
import { IFilterButtonCustomIcon } from "../shared/index.js";

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

    showDropDownHeaderMessage?: boolean;
    customFilterName?: string;
    disabled?: boolean;
    openOnInit?: boolean;

    onApplyClick: () => void;
    onCancelClick: () => void;
    onDropdownOpenChanged: (isOpen: boolean) => void;

    errors?: IExtendedDateFilterErrors;

    weekStart?: WeekStart;
    customIcon?: IFilterButtonCustomIcon;
    FilterConfigurationComponent?: React.ComponentType<IFilterConfigurationProps>;

    withoutApply?: boolean;
    ButtonComponent?: ComponentType<IDateFilterButtonProps>;

    /**
     * Specifies the overlay position type for the date filter dropdown.
     */
    overlayPositionType?: OverlayPositionType;
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

export function DateFilterCore({
    originalSelectedFilterOption,
    originalExcludeCurrentPeriod,
    selectedFilterOption,
    excludeCurrentPeriod,
    onDropdownOpenChanged,
    customFilterName,
    dateFormat,
    disabled,
    openOnInit,
    locale,
    filterOptions,
    isTimeForAbsoluteRangeEnabled,
    weekStart,
    customIcon,
    FilterConfigurationComponent,
    onApplyClick,
    onCancelClick,
    showDropDownHeaderMessage,
    withoutApply,
    ButtonComponent,
    overlayPositionType,
    ...dropdownBodyProps
}: IDateFilterCoreProps) {
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const verifiedDateFormat = verifyDateFormat(dateFormat);

    const dateFilterContainerRef = useRef<HTMLDivElement>(null);
    const dateFilterBodyRef = useRef<HTMLDivElement>(null);

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "DateFilter" }));

    const filteredFilterOptions = useMemo(() => {
        return flow(filterVisibleDateFilterOptions, sanitizePresetIntervals)(filterOptions);
    }, [filterOptions]);

    const closeConfiguration = () => {
        setIsConfigurationOpen(false);
    };

    const openConfiguration = () => {
        setIsConfigurationOpen(true);
    };

    const cancelConfiguration = () => {
        closeConfiguration();
        onCancelClick();
    };

    const handleOpenStateChanged = (isOpen: boolean) => {
        onDropdownOpenChanged(isOpen);

        if (!isOpen) {
            closeConfiguration();
        }
    };

    const lastValidSelectedFilterOption = useLastValidValue(
        selectedFilterOption,
        isEmpty(dropdownBodyProps.errors),
    );

    const lastValidExcludeCurrentPeriod = useLastValidValue(
        excludeCurrentPeriod,
        isEmpty(dropdownBodyProps.errors),
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, closeDropdown = noop) => {
            const keyboardHandler = createDateFilterKeyboardHandler({
                dateFilterContainerRef,
                dateFilterBodyRef,
                closeDropdown,
            });
            keyboardHandler(event);
        },
        [dateFilterContainerRef, dateFilterBodyRef],
    );

    return (
        <IntlWrapper locale={locale || "en-US"}>
            <ValidationContextStore value={validationContextValue}>
                <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                    {(isMobile) => {
                        const dateFilterButton = (
                            isOpen: boolean = false,
                            buttonRef: React.MutableRefObject<HTMLElement | null> = null,
                            dropdownId: string = "",
                            toggleDropdown = noop,
                        ) => (
                            <DateFilterButtonLocalized
                                disabled={disabled}
                                isMobile={isMobile}
                                isOpen={isOpen}
                                dateFilterOption={applyExcludeCurrentPeriod(
                                    withoutApply
                                        ? lastValidSelectedFilterOption
                                        : originalSelectedFilterOption,
                                    withoutApply
                                        ? lastValidExcludeCurrentPeriod
                                        : originalExcludeCurrentPeriod,
                                )}
                                dateFormat={adjustDateFormatForDisplay(
                                    verifiedDateFormat,
                                    isTimeForAbsoluteRangeEnabled,
                                )}
                                customFilterName={customFilterName}
                                customIcon={customIcon}
                                onClick={toggleDropdown}
                                ButtonComponent={ButtonComponent}
                                buttonRef={buttonRef}
                                dropdownId={dropdownId}
                            />
                        );
                        return (
                            <Dropdown
                                openOnInit={openOnInit}
                                closeOnParentScroll={true}
                                closeOnMouseDrag={true}
                                closeOnOutsideClick={true}
                                enableEventPropagation={true}
                                autofocusOnOpen
                                initialFocus={DATE_FILTER_SELECTED_LIST_ITEM_ID}
                                alignPoints={[
                                    { align: "bl tl" },
                                    { align: "tr tl" },
                                    { align: "br tr", offset: { x: -11 } },
                                    { align: "tr tl", offset: { x: 0, y: -100 } },
                                    { align: "tr tl", offset: { x: 0, y: -50 } },
                                ]}
                                onOpenStateChanged={handleOpenStateChanged}
                                overlayPositionType={overlayPositionType}
                                renderButton={({ isOpen, buttonRef, dropdownId, toggleDropdown }) => (
                                    <span onClick={disabled ? noop : toggleDropdown}>
                                        {dateFilterButton(isOpen, buttonRef, dropdownId, toggleDropdown)}
                                    </span>
                                )}
                                ignoreClicksOnByClass={[
                                    ".s-do-not-close-dropdown-on-click",
                                    ".rdp-day", // absolute range picker calendar items
                                ]}
                                renderBody={({ closeDropdown, ariaAttributes }) => {
                                    return isConfigurationOpen ? (
                                        <FilterConfigurationComponent
                                            onSaveButtonClick={closeConfiguration}
                                            onCancelButtonClick={cancelConfiguration}
                                        />
                                    ) : (
                                        // Dropdown component uses React.Children.map and adds special props to this component
                                        // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children
                                        <div
                                            role="dialog"
                                            className="gd-extended-date-filter-container"
                                            id={ariaAttributes.id}
                                            ref={dateFilterContainerRef}
                                            onKeyDown={(e) => handleKeyDown(e, closeDropdown)}
                                        >
                                            <DateFilterBody
                                                {...dropdownBodyProps}
                                                selectedFilterOption={selectedFilterOption}
                                                excludeCurrentPeriod={excludeCurrentPeriod}
                                                showHeaderMessage={showDropDownHeaderMessage}
                                                onApplyClick={onApplyClick}
                                                onCancelClick={onCancelClick}
                                                filterOptions={filteredFilterOptions}
                                                isMobile={isMobile}
                                                closeDropdown={closeDropdown}
                                                dateFilterButton={dateFilterButton()}
                                                dateFormat={verifiedDateFormat}
                                                isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                                                weekStart={weekStart}
                                                isConfigurationEnabled={
                                                    FilterConfigurationComponent !== undefined
                                                }
                                                onConfigurationClick={openConfiguration}
                                                withoutApply={withoutApply}
                                                ref={dateFilterBodyRef}
                                            />
                                        </div>
                                    );
                                }}
                            />
                        );
                    }}
                </MediaQuery>
            </ValidationContextStore>
        </IntlWrapper>
    );
}

function useLastValidValue<T>(value: T, isValid: boolean): T | undefined {
    const lastValidValue = useRef<T | undefined>();
    if (isValid) {
        lastValidValue.current = value;
    }
    return lastValidValue.current;
}
