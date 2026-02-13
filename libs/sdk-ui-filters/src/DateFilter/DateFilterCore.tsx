// (C) 2007-2026 GoodData Corporation

import {
    type ComponentType,
    type KeyboardEvent,
    type MutableRefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import { format } from "date-fns";
import { isEmpty } from "lodash-es";
import { MediaQuery } from "react-responsive";

import { type DateFilterGranularity, type IActiveCalendars, type WeekStart } from "@gooddata/sdk-model";
import {
    IntlWrapper,
    ValidationContextStore,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { Dropdown, type OverlayPositionType } from "@gooddata/sdk-ui-kit";

import {
    DATE_FILTER_ACTIVE_CALENDAR_TAB_ID,
    DATE_FILTER_CUSTOM_RELATIVE_ID,
    DATE_FILTER_CUSTOM_STATIC_ID,
    DATE_FILTER_SELECTED_LIST_ITEM_ID,
} from "./accessibility/elementId.js";
import { createDateFilterKeyboardHandler } from "./accessibility/keyboardNavigation.js";
import { DEFAULT_DATE_FORMAT, TIME_FORMAT_WITH_SEPARATOR } from "./constants/Platform.js";
import { DateFilterBody } from "./DateFilterBody/DateFilterBody.js";
import { DateFilterBodyRedesigned } from "./DateFilterBody/DateFilterBodyRedesigned.js";
import { type IFilterConfigurationProps } from "./DateFilterBody/types.js";
import { type IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import { DateFilterButtonLocalized } from "./DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import {
    type DateFilterOption,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
} from "./interfaces/index.js";
import { filterVisibleDateFilterOptions, sanitizePresetIntervals } from "./utils/OptionUtils.js";
import { applyExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { getFiscalTabsConfig } from "./utils/presetFilterUtils.js";
import { MediaQueries } from "../constants/MediaQueries.js";
import { type IFilterButtonCustomIcon } from "../shared/interfaces/index.js";

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
    hideDisabledExclude?: boolean;
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
    FilterConfigurationComponent?: ComponentType<IFilterConfigurationProps>;

    withoutApply?: boolean;
    ButtonComponent?: ComponentType<IDateFilterButtonProps>;

    /**
     * Specifies the overlay position type for the date filter dropdown.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Specifies whether to improve accessibility for the date filter content.
     *
     * @alpha
     */
    improveAccessibility?: boolean;

    /**
     * Active calendars configuration from workspace settings.
     * Controls which calendar types (standard/fiscal) are available in the filter.
     *
     * @alpha
     */
    activeCalendars?: IActiveCalendars;
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

const getInitialFocus = (
    selectedFilterOption: DateFilterOption,
    filterOptions: IDateFilterOptionsByType,
    improveAccessibility: boolean,
    activeCalendars?: IActiveCalendars,
) => {
    if (!improveAccessibility) {
        return DATE_FILTER_SELECTED_LIST_ITEM_ID;
    }

    const { showTabs } = getFiscalTabsConfig(filterOptions.relativePreset, activeCalendars);
    if (showTabs) {
        return DATE_FILTER_ACTIVE_CALENDAR_TAB_ID;
    }

    if (selectedFilterOption.localIdentifier === filterOptions.relativeForm?.localIdentifier) {
        return DATE_FILTER_CUSTOM_RELATIVE_ID;
    }
    if (selectedFilterOption.localIdentifier === filterOptions.absoluteForm?.localIdentifier) {
        return DATE_FILTER_CUSTOM_STATIC_ID;
    }
    return DATE_FILTER_SELECTED_LIST_ITEM_ID;
};

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
    improveAccessibility = false,
    activeCalendars,
    hideDisabledExclude,
    ...dropdownBodyProps
}: IDateFilterCoreProps) {
    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
    const verifiedDateFormat = verifyDateFormat(dateFormat);

    const dateFilterContainerRef = useRef<HTMLDivElement>(null);
    const dateFilterBodyRef = useRef<HTMLDivElement>(null);

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "DateFilter" }));

    const filteredFilterOptions = useMemo(() => {
        return sanitizePresetIntervals(filterVisibleDateFilterOptions(filterOptions));
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
        (event: KeyboardEvent, closeDropdown = () => {}) => {
            const keyboardHandler = createDateFilterKeyboardHandler({
                dateFilterContainerRef,
                dateFilterBodyRef,
                closeDropdown,
            });
            keyboardHandler(event);
        },
        [dateFilterContainerRef, dateFilterBodyRef],
    );

    const DateFilterBodyComponent = improveAccessibility ? DateFilterBodyRedesigned : DateFilterBody;
    const initialFocus = getInitialFocus(
        selectedFilterOption,
        filterOptions,
        improveAccessibility,
        activeCalendars,
    );

    return (
        <IntlWrapper locale={locale || "en-US"}>
            <ValidationContextStore value={validationContextValue}>
                <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                    {(isMobile) => {
                        const dateFilterButton = (
                            isOpen: boolean = false,
                            buttonRef: MutableRefObject<HTMLElement | null> | null = null,
                            dropdownId: string = "",
                            toggleDropdown = () => {},
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
                                        ? (lastValidExcludeCurrentPeriod ?? false)
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
                                buttonRef={buttonRef ?? undefined}
                                dropdownId={dropdownId}
                            />
                        );
                        return (
                            <Dropdown
                                openOnInit={openOnInit}
                                closeOnParentScroll
                                closeOnMouseDrag
                                closeOnOutsideClick
                                enableEventPropagation
                                autofocusOnOpen
                                initialFocus={initialFocus}
                                alignPoints={[
                                    { align: "bl tl" },
                                    { align: "tr tl" },
                                    { align: "cr cl" },
                                    { align: "tl bl", offset: { x: 0, y: 0 } },
                                    { align: "br tr", offset: { x: -11 } },
                                    { align: "tr tl", offset: { x: 0, y: -100 } },
                                    { align: "tr tl", offset: { x: 0, y: -50 } },
                                ]}
                                onOpenStateChanged={handleOpenStateChanged}
                                overlayPositionType={overlayPositionType}
                                renderButton={({ isOpen, buttonRef, dropdownId, toggleDropdown }) => (
                                    <span onClick={disabled ? () => {} : toggleDropdown}>
                                        {dateFilterButton(isOpen, buttonRef, dropdownId, toggleDropdown)}
                                    </span>
                                )}
                                ignoreClicksOnByClass={[
                                    ".s-do-not-close-dropdown-on-click",
                                    ".rdp-day", // absolute range picker calendar items
                                ]}
                                renderBody={({ closeDropdown, ariaAttributes }) => {
                                    return isConfigurationOpen && FilterConfigurationComponent ? (
                                        <FilterConfigurationComponent
                                            onSaveButtonClick={closeConfiguration}
                                            onCancelButtonClick={cancelConfiguration}
                                        />
                                    ) : (
                                        // Dropdown component uses Children.map and adds special props to this component
                                        // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children
                                        <div
                                            {...(!improveAccessibility && { role: "dialog" })}
                                            className="gd-extended-date-filter-container"
                                            {...(!improveAccessibility && { id: ariaAttributes.id })}
                                            ref={dateFilterContainerRef}
                                            onKeyDown={(e) => handleKeyDown(e, closeDropdown)}
                                            {...(!improveAccessibility && { "aria-label": customFilterName })}
                                        >
                                            <DateFilterBodyComponent
                                                {...dropdownBodyProps}
                                                activeCalendars={activeCalendars}
                                                {...(improveAccessibility && { id: ariaAttributes.id })}
                                                {...(improveAccessibility && {
                                                    "aria-label": customFilterName,
                                                })}
                                                selectedFilterOption={selectedFilterOption}
                                                excludeCurrentPeriod={excludeCurrentPeriod}
                                                hideDisabledExclude={hideDisabledExclude}
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
    const lastValidValue = useRef<T | undefined>(undefined);
    if (isValid) {
        lastValidValue.current = value;
    }
    return lastValidValue.current;
}
