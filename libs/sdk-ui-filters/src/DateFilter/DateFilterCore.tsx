// (C) 2007-2025 GoodData Corporation
import React, { ComponentType, useCallback, useMemo, useRef, useState } from "react";
import flow from "lodash/flow.js";
import noop from "lodash/noop.js";
import DefaultMediaQuery from "react-responsive";
import { defaultImport } from "default-import";
import format from "date-fns/format/index.js";
import { DateFilterGranularity, WeekStart } from "@gooddata/sdk-model";
import { Dropdown, getFocusableElements, makeMenuKeyboardNavigation } from "@gooddata/sdk-ui-kit";
import { IExtendedDateFilterErrors, IDateFilterOptionsByType, DateFilterOption } from "./interfaces/index.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants/index.js";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody.js";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { DEFAULT_DATE_FORMAT, TIME_FORMAT_WITH_SEPARATOR } from "./constants/Platform.js";
import { filterVisibleDateFilterOptions, sanitizePresetIntervals } from "./utils/OptionUtils.js";
import { IFilterButtonCustomIcon } from "../shared/index.js";
import { IFilterConfigurationProps } from "./DateFilterBody/types.js";
import isEmpty from "lodash/isEmpty.js";
import { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import {
    DATE_FILTER_APPLY_BUTTON_ID,
    DATE_FILTER_CANCEL_BUTTON_ID,
    DATE_FILTER_INPUT_HECKBOX_ID,
    DATE_FILTER_SELECTED_ITEM,
} from "./utils/accessibility/elementId.js";

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
    ...dropdownBodyProps
}) => {
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const verifiedDateFormat = verifyDateFormat(dateFormat);

    const dateFilterBodyRef = useRef<HTMLDivElement>(null);

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

    const shouldHandleKeyboardNavigation = (
        ref: React.MutableRefObject<HTMLDivElement>,
        activeElement: HTMLElement,
    ) => ref.current.contains(activeElement);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, closeDropdown = noop) => {
            if (!dateFilterBodyRef.current) return;

            const items = Array.from(dateFilterBodyRef.current.querySelectorAll("[tabindex]"));
            const activeElement = document.activeElement as HTMLElement;
            const currentIndex = items.findIndex((item) => item === activeElement);

            const keyboardHandler = makeMenuKeyboardNavigation({
                onFocusPrevious: () => {
                    if (shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement)) {
                        const previousElement =
                            currentIndex <= 0 ? items[items.length - 1] : items[currentIndex - 1];

                        (previousElement as HTMLElement)?.focus();
                    }
                },
                onFocusNext: () => {
                    if (shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement)) {
                        const nextElement =
                            currentIndex === items.length - 1 ? items[0] : items[currentIndex + 1];

                        (nextElement as HTMLElement)?.focus();
                    }
                },
                onFocusFirst: () => {
                    if (shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement)) {
                        const { firstElement } = getFocusableElements(dateFilterBodyRef.current);
                        firstElement?.focus();
                    }
                },
                onFocusLast: () => {
                    if (shouldHandleKeyboardNavigation(dateFilterBodyRef, activeElement)) {
                        const { lastElement } = getFocusableElements(dateFilterBodyRef.current);
                        lastElement?.focus();
                    }
                },
                onClose: () => {
                    closeDropdown();
                },
                onUnhandledKeyDown: (event) => {
                    if (event.key !== "Tab") {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const focusIds = [
                        DATE_FILTER_SELECTED_ITEM,
                        DATE_FILTER_INPUT_HECKBOX_ID,
                        DATE_FILTER_CANCEL_BUTTON_ID,
                        DATE_FILTER_APPLY_BUTTON_ID,
                    ];
                    const focusElements = focusIds
                        .map((id) => document.getElementById(id))
                        .filter((el) => el && !el.hasAttribute("disabled"));

                    const active = document.activeElement as HTMLElement;
                    const currentIndex = focusElements.indexOf(active);

                    if (currentIndex !== -1) {
                        const direction = event.shiftKey ? -1 : 1;
                        const nextIndex =
                            (currentIndex + direction + focusElements.length) % focusElements.length;

                        focusElements[nextIndex].focus();
                    } else {
                        const direction = event.shiftKey ? focusElements.length - 1 : 1;
                        focusElements[direction].focus();
                    }
                },
            });

            keyboardHandler(event);
        },
        [dateFilterBodyRef],
    );

    return (
        <IntlWrapper locale={locale || "en-US"}>
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
                                withoutApply ? lastValidSelectedFilterOption : originalSelectedFilterOption,
                                withoutApply ? lastValidExcludeCurrentPeriod : originalExcludeCurrentPeriod,
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
                            initialFocus={DATE_FILTER_SELECTED_ITEM}
                            alignPoints={[
                                { align: "bl tl" },
                                { align: "tr tl" },
                                { align: "br tr", offset: { x: -11 } },
                                { align: "tr tl", offset: { x: 0, y: -100 } },
                                { align: "tr tl", offset: { x: 0, y: -50 } },
                            ]}
                            onOpenStateChanged={handleOpenStateChanged}
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
                                        id={ariaAttributes.id}
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
        </IntlWrapper>
    );
};

function useLastValidValue<T>(value: T, isValid: boolean): T | undefined {
    const lastValidValue = useRef<T | undefined>();
    if (isValid) {
        lastValidValue.current = value;
    }
    return lastValidValue.current;
}
