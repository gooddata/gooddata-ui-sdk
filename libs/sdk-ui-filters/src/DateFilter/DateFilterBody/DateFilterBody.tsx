// (C) 2007-2026 GoodData Corporation

import {
    type CSSProperties,
    type KeyboardEvent,
    type ReactElement,
    forwardRef,
    useEffect,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type DateFilterGranularity,
    type IActiveCalendars,
    type WeekStart,
    isAbsoluteDateFilterForm,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
    isRelativeDateFilterForm,
} from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DateFilterBodyButton } from "./DateFilterBodyButton.js";
import { DateFilterBodyContentFiltered } from "./DateFilterBodyContentFiltered.js";
import { DateFilterConfigurationButton } from "./DateFilterConfigurationButton.js";
import { DateFilterCustomPeriodButtons } from "./DateFilterCustomPeriodButtons.js";
import { DateFilterFormContent } from "./DateFilterFormContent.js";
import { EditModeMessage } from "./EditModeMessage.js";
import { type DateFilterRoute } from "./types.js";
import { CheckboxSection } from "../CheckboxSection/CheckboxSection.js";
import {
    type DateFilterOption,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
    type IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { getDateFilterOptionGranularity } from "../utils/OptionUtils.js";
import {
    type CalendarTabType,
    ensureCompatibleGranularity,
    getDefaultCalendarTab,
    getFilteredGranularities,
    getFilteredPresets,
    getFiscalTabsConfig,
} from "../utils/presetFilterUtils.js";
import { VisibleScrollbar } from "../VisibleScrollbar/VisibleScrollbar.js";

const ACTIONS_BUTTONS_HEIGHT = 53;
const EXCLUDE_OPEN_PERIOD_HEIGHT = 30; // height of 'Exclude open period' checkbox component
const MARGIN_BOTTOM = 8;
const MOBILE_WIDTH = 414; // iPhone 11 Pro Max
const SMALL_SCREEN_HEIGHT = 640;

export interface IDateFilterBodyProps {
    dateFormat: string;
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;

    excludeCurrentPeriod: boolean;
    hideDisabledExclude?: boolean;
    isExcludeCurrentPeriodEnabled: boolean;
    onExcludeCurrentPeriodChange: (isExcluded: boolean) => void;
    isTimeForAbsoluteRangeEnabled: boolean;

    availableGranularities: DateFilterGranularity[];

    isEditMode: boolean;
    isMobile: boolean;
    showHeaderMessage?: boolean;

    onApplyClick: () => void;
    onCancelClick: () => void;
    closeDropdown: () => void;

    errors?: IExtendedDateFilterErrors;
    dateFilterButton: ReactElement;

    weekStart?: WeekStart;
    isConfigurationEnabled?: boolean;
    onConfigurationClick: () => void;

    withoutApply?: boolean;
    ariaLabel?: string;
    id?: string;

    /**
     * Active calendars configuration from workspace settings.
     * @alpha
     */
    activeCalendars?: IActiveCalendars;

    /**
     * Enables empty date values UI (e.g. “Other → Empty values” preset, empty-values handling controls).
     *
     * @alpha
     */
    enableEmptyDateValues?: boolean;
}

export const DateFilterBody = forwardRef<HTMLDivElement, IDateFilterBodyProps>((props, ref) => {
    const [route, setRoute] = useState<DateFilterRoute>(null);
    // Refs for focus management when navigating back from forms
    // This ensures that when a user navigates back from a form using the back button,
    // focus is returned to the button that originally opened that form
    const absoluteButtonRef = useRef<HTMLButtonElement>(null);
    const relativeButtonRef = useRef<HTMLButtonElement>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const didResetMobileScroll = useRef(false);
    const didSyncInitialMobileRoute = useRef(false);

    const intl = useIntl();

    const fiscalTabsConfig = getFiscalTabsConfig(props.filterOptions.relativePreset, props.activeCalendars);

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(props.activeCalendars, props.selectedFilterOption),
    );

    const filteredRelativePreset = getFilteredPresets(
        props.filterOptions.relativePreset,
        fiscalTabsConfig,
        selectedTab,
    );
    const filteredAvailableGranularities = getFilteredGranularities(
        props.availableGranularities,
        fiscalTabsConfig,
        selectedTab,
    );

    const changeRoute = (newRoute: DateFilterRoute = null): void => {
        setRoute(newRoute);
    };

    const handleStaticButtonClick = () => {
        const newForm = route === "absoluteForm" ? null : "absoluteForm";
        setRoute(newForm);

        if (
            newForm === "absoluteForm" &&
            filterOptions.absoluteForm &&
            selectedFilterOption.localIdentifier !== filterOptions.absoluteForm.localIdentifier
        ) {
            onSelectedFilterOptionChange(filterOptions.absoluteForm);
        }
    };

    const handleRelativeButtonClick = () => {
        const newForm = route === "relativeForm" ? null : "relativeForm";
        setRoute(newForm);

        if (newForm === "relativeForm" && filterOptions.relativeForm) {
            const isFiscal = fiscalTabsConfig.showTabs && selectedTab === "fiscal";

            // Determine which filter option to use as base
            const baseOption =
                selectedFilterOption.localIdentifier === filterOptions.relativeForm.localIdentifier
                    ? (selectedFilterOption as IUiRelativeDateFilterForm)
                    : filterOptions.relativeForm;

            // Ensure granularity is compatible with available granularities for current tab
            const correctedOption = ensureCompatibleGranularity(
                baseOption,
                filteredAvailableGranularities,
                isFiscal,
            );

            // Only update if something changed
            if (correctedOption !== baseOption) {
                onSelectedFilterOptionChange(correctedOption);
            } else if (selectedFilterOption.localIdentifier !== filterOptions.relativeForm.localIdentifier) {
                onSelectedFilterOptionChange(filterOptions.relativeForm);
            }
        }
    };

    const handleBackNavigation = () => {
        const previousForm = route;
        setRoute(null);

        // Focus the corresponding button after the state update
        // This improves accessibility by returning focus to the element that opened the form
        setTimeout(() => {
            if (previousForm === "absoluteForm" && absoluteButtonRef.current) {
                absoluteButtonRef.current.focus();
            } else if (previousForm === "relativeForm" && relativeButtonRef.current) {
                relativeButtonRef.current.focus();
            }
        }, 0);
    };

    useEffect(() => {
        // Sync route from selected option only once after mount on mobile.
        // Without this guard, later option updates (e.g. checkbox toggles that keep the same form type)
        // would unexpectedly reopen the form after the user navigated back to the list.
        if (!props.isMobile || didSyncInitialMobileRoute.current) {
            return;
        }

        didSyncInitialMobileRoute.current = true;
        if (isAbsoluteDateFilterForm(props.selectedFilterOption)) {
            changeRoute("absoluteForm");
        } else if (isRelativeDateFilterForm(props.selectedFilterOption)) {
            changeRoute("relativeForm");
        }
    }, [props.isMobile, props.selectedFilterOption]);

    const calculateHeight = (
        showExcludeCurrent: boolean,
        showEmptyValuesHandling: boolean,
    ): number | undefined => {
        // Mobile in Horizontal Layout
        if (window.innerHeight <= MOBILE_WIDTH) {
            const checkboxCount = (showExcludeCurrent ? 1 : 0) + (showEmptyValuesHandling ? 1 : 0);
            const checkboxHeight = checkboxCount * EXCLUDE_OPEN_PERIOD_HEIGHT;
            return window.innerHeight - checkboxHeight - ACTIONS_BUTTONS_HEIGHT - MARGIN_BOTTOM;
        }
        return undefined;
    };

    const getVisibleScrollbarClassName = (): string => {
        if (window.innerHeight <= SMALL_SCREEN_HEIGHT) {
            return "gd-extended-date-filter-body-scrollable-small-screen";
        }
        return "gd-extended-date-filter-body-scrollable";
    };

    const {
        isExcludeCurrentPeriodEnabled,
        isMobile,
        dateFilterButton,
        errors,
        isConfigurationEnabled,
        withoutApply,
        selectedFilterOption,
        isEditMode,
        excludeCurrentPeriod,
        hideDisabledExclude,
        filterOptions,
        showHeaderMessage = true,
        dateFormat,
        isTimeForAbsoluteRangeEnabled,
        weekStart = "Sunday",
        availableGranularities,
        onApplyClick,
        onCancelClick,
        closeDropdown,
        onConfigurationClick,
        onExcludeCurrentPeriodChange,
        onSelectedFilterOptionChange,
        ariaLabel,
        id,
    } = props;
    // Keep the same behavior as `DateFilterBody`:
    // - hide disabled exclude toggle on mobile by default
    // - allow callers to hide it on desktop via `hideDisabledExclude`
    const hideWhenDisabled = !!hideDisabledExclude || isMobile;
    const shouldRenderExcludeCurrent = !(hideWhenDisabled && !isExcludeCurrentPeriodEnabled);

    const shouldRenderEmptyValuesHandling =
        !!props.enableEmptyDateValues &&
        !isEmptyValuesDateFilterOption(selectedFilterOption) &&
        selectedFilterOption.emptyValueHandling !== "only";
    const isAllTimeSelected = isAllTimeDateFilterOption(selectedFilterOption);
    const effectiveEmptyValueHandling =
        selectedFilterOption.emptyValueHandling ?? (isAllTimeSelected ? "include" : "exclude");
    const emptyValuesToggleMode = isAllTimeSelected ? ("exclude" as const) : ("include" as const);
    const emptyValuesToggleChecked = isAllTimeSelected
        ? effectiveEmptyValueHandling !== "include"
        : effectiveEmptyValueHandling === "include";

    const bodyHeight = calculateHeight(
        shouldRenderExcludeCurrent,
        shouldRenderEmptyValuesHandling && route === null,
    );
    const visibleScrollbarClassName = getVisibleScrollbarClassName();
    let wrapperStyle: CSSProperties = {};
    let scrollerStyle: CSSProperties = {};
    if (bodyHeight) {
        // display: flex causes the scroller is cut off when scrolling
        wrapperStyle = { display: "block", height: `${bodyHeight}px` };
        scrollerStyle = { minHeight: `${bodyHeight}px` };
    }

    const hasFormOptions = !!(
        filterOptions.absoluteForm ||
        (filterOptions.relativeForm && availableGranularities.length > 0)
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft" && route) {
            e.preventDefault();
            e.stopPropagation();
            handleBackNavigation();
        }
    };

    const handleFocus = () => {
        if (isMobile && !didResetMobileScroll.current) {
            didResetMobileScroll.current = true;
            rootRef.current?.scrollIntoView({ block: "start" });
        }
    };

    const idBase = useIdPrefixed();

    const absoluteFormId = "absoluteForm" + idBase;
    const relativeFormId = "relativeForm" + idBase;

    const formId = route ? (route === "absoluteForm" ? absoluteFormId : relativeFormId) : id;

    const formLabel = route
        ? route === "absoluteForm"
            ? intl.formatMessage({ id: "filters.staticPeriod" })
            : intl.formatMessage({ id: "filters.floatingRange" })
        : ariaLabel;

    return (
        <div
            ref={rootRef}
            className={cx(
                !isMobile && "gd-extended-date-filter-body-redesigned",
                "gd-extended-date-filter-body",
                "s-extended-date-filters-body",
                isMobile && "gd-extended-date-filter-body-mobile",
                route && "gd-active-form",
            )}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            role={"dialog"}
            id={formId}
            aria-label={formLabel}
        >
            {route === null && isMobile ? (
                <div
                    className="gd-extended-date-filter-mobile-header"
                    onClick={() => {
                        onCancelClick();
                        closeDropdown();
                    }}
                >
                    {dateFilterButton}
                </div>
            ) : null}

            {/* Form view - completely separate from listbox */}
            {route ? (
                <div className="gd-extended-date-filter-form-wrapper" ref={ref}>
                    <DateFilterFormContent
                        filterOptions={filterOptions}
                        selectedFilterOption={selectedFilterOption}
                        onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                        dateFormat={dateFormat}
                        weekStart={weekStart}
                        isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                        availableGranularities={filteredAvailableGranularities}
                        isMobile={isMobile}
                        withoutApply={withoutApply}
                        enableEmptyDateValues={props.enableEmptyDateValues}
                        activeForm={route}
                        onBackNavigation={handleBackNavigation}
                        onClose={closeDropdown}
                        submitForm={() => {
                            onApplyClick();
                            if (!withoutApply) {
                                closeDropdown();
                            }
                        }}
                        errors={errors || undefined}
                    />
                </div>
            ) : null}

            {/* List view - only visible when no form is active */}
            {route ? null : (
                <div
                    ref={ref}
                    className={cx("gd-extended-date-filter-body-wrapper", {
                        "gd-extended-date-filter-body-wrapper-wide":
                            isRelativeDateFilterForm(selectedFilterOption),
                    })}
                    style={wrapperStyle}
                >
                    {isEditMode && !isMobile && showHeaderMessage ? <EditModeMessage /> : null}
                    {isMobile ? (
                        <DateFilterBodyContentFiltered
                            filterOptions={filterOptions}
                            selectedFilterOption={selectedFilterOption}
                            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                            isMobile={isMobile}
                            dateFormat={dateFormat}
                            showTabs={fiscalTabsConfig.showTabs}
                            selectedTab={selectedTab}
                            onTabSelect={setSelectedTab}
                            filteredRelativePreset={filteredRelativePreset}
                            enableEmptyDateValues={props.enableEmptyDateValues}
                        />
                    ) : (
                        <VisibleScrollbar className={visibleScrollbarClassName} style={scrollerStyle}>
                            <DateFilterBodyContentFiltered
                                filterOptions={filterOptions}
                                selectedFilterOption={selectedFilterOption}
                                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                isMobile={isMobile}
                                dateFormat={dateFormat}
                                showTabs={fiscalTabsConfig.showTabs}
                                selectedTab={selectedTab}
                                onTabSelect={setSelectedTab}
                                filteredRelativePreset={filteredRelativePreset}
                                enableEmptyDateValues={props.enableEmptyDateValues}
                            />
                        </VisibleScrollbar>
                    )}
                </div>
            )}

            {hasFormOptions && !route ? (
                <>
                    {isMobile ? null : <div className="gd-date-filter-menu-divider" />}
                    <DateFilterCustomPeriodButtons
                        filterOptions={filterOptions}
                        selectedFilterOption={selectedFilterOption}
                        availableGranularities={availableGranularities}
                        onStaticButtonClick={handleStaticButtonClick}
                        onRelativeButtonClick={handleRelativeButtonClick}
                        absoluteButtonRef={absoluteButtonRef}
                        relativeButtonRef={relativeButtonRef}
                        absoluteFormId={absoluteFormId}
                        relativeFormId={relativeFormId}
                    />
                </>
            ) : null}

            <CheckboxSection
                visible={!route}
                showDivider
                emptyValuesHandling={
                    shouldRenderEmptyValuesHandling
                        ? {
                              mode: emptyValuesToggleMode,
                              checked: emptyValuesToggleChecked,
                              onChange: (checked) => {
                                  const emptyValueHandling = isAllTimeSelected
                                      ? checked
                                          ? "exclude"
                                          : undefined
                                      : checked
                                        ? "include"
                                        : undefined;
                                  onSelectedFilterOptionChange({
                                      ...selectedFilterOption,
                                      emptyValueHandling,
                                  });
                              },
                              testId: "date-filter-empty-values-handling-checkbox",
                          }
                        : undefined
                }
                excludeCurrentPeriod={
                    shouldRenderExcludeCurrent
                        ? {
                              value: excludeCurrentPeriod,
                              onChange: onExcludeCurrentPeriodChange,
                              disabled: !isExcludeCurrentPeriodEnabled,
                              granularity: getDateFilterOptionGranularity(selectedFilterOption),
                          }
                        : undefined
                }
            />

            <div role="group" className={cx("gd-extended-date-filter-actions")}>
                <div className="gd-extended-date-filter-actions-left-content">
                    {isConfigurationEnabled ? (
                        <DateFilterConfigurationButton onConfiguration={onConfigurationClick} />
                    ) : null}
                </div>
                <div className="gd-extended-date-filter-actions-buttons">
                    <DateFilterBodyButton
                        messageId={withoutApply ? "close" : "cancel"}
                        className={cx(
                            "gd-button-secondary",
                            isMobile ? "gd-button-medium" : "gd-button-small",
                            withoutApply ? "s-date-filter-close" : "s-date-filter-cancel",
                        )}
                        onClick={() => {
                            onCancelClick();
                            closeDropdown();
                        }}
                    />
                    {!withoutApply && (
                        <DateFilterBodyButton
                            messageId="apply"
                            className={cx(
                                "gd-button-action",
                                isMobile ? "gd-button-medium" : "gd-button-small",
                                "s-date-filter-apply",
                            )}
                            disabled={!isEmpty(errors)}
                            onClick={() => {
                                onApplyClick();
                                closeDropdown();
                            }}
                            describedByFromValidation
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

DateFilterBody.displayName = "DateFilterBody";
