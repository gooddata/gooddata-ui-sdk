// (C) 2007-2026 GoodData Corporation

import { type CSSProperties, type KeyboardEvent, forwardRef, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { isEmpty } from "lodash-es";
import { useIntl } from "react-intl";

import { isAbsoluteDateFilterForm, isRelativeDateFilterForm } from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IDateFilterBodyProps } from "./DateFilterBody.js";
import { DateFilterBodyButton } from "./DateFilterBodyButton.js";
import { DateFilterBodyContentFiltered } from "./DateFilterBodyContentFiltered.js";
import { DateFilterBodyMobileContent } from "./DateFilterBodyMobileContent.js";
import { DateFilterConfigurationButton } from "./DateFilterConfigurationButton.js";
import { DateFilterCustomPeriodButtons } from "./DateFilterCustomPeriodButtons.js";
import { DateFilterFormContent } from "./DateFilterFormContent.js";
import { EditModeMessage } from "./EditModeMessage.js";
import { type DateFilterRoute } from "./types.js";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggle.js";
import { type IUiRelativeDateFilterForm } from "../interfaces/index.js";
import { getDateFilterOptionGranularity } from "../utils/OptionUtils.js";
import {
    type CalendarTabType,
    ensureCompatibleGranularity,
    filterFiscalGranularities,
    filterFiscalPresets,
    filterStandardGranularities,
    filterStandardPresets,
    getDefaultCalendarTab,
    getFiscalTabsConfig,
} from "../utils/presetFilterUtils.js";
import { VisibleScrollbar } from "../VisibleScrollbar/VisibleScrollbar.js";

const ACTIONS_BUTTONS_HEIGHT = 53;
const EXCLUDE_OPEN_PERIOD_HEIGHT = 30; // height of 'Exclude open period' checkbox component
const MARGIN_BOTTOM = 8;
const MOBILE_WIDTH = 414; // iPhone 11 Pro Max
const SMALL_SCREEN_HEIGHT = 640;

export const DateFilterBodyRedesigned = forwardRef<HTMLDivElement, IDateFilterBodyProps>((props, ref) => {
    const [route, setRoute] = useState<DateFilterRoute>(null);
    // Refs for focus management when navigating back from forms
    // This ensures that when a user navigates back from a form using the back button,
    // focus is returned to the button that originally opened that form
    const absoluteButtonRef = useRef<HTMLButtonElement>(null);
    const relativeButtonRef = useRef<HTMLButtonElement>(null);

    const intl = useIntl();

    const { showTabs } = getFiscalTabsConfig(props.filterOptions.relativePreset, props.activeCalendars);

    const [selectedTab, setSelectedTab] = useState<CalendarTabType>(() =>
        getDefaultCalendarTab(props.activeCalendars, props.selectedFilterOption),
    );

    const filteredRelativePreset = showTabs
        ? selectedTab === "standard"
            ? filterStandardPresets(props.filterOptions.relativePreset!)
            : filterFiscalPresets(props.filterOptions.relativePreset!)
        : props.filterOptions.relativePreset;

    const filteredAvailableGranularities = showTabs
        ? selectedTab === "standard"
            ? filterStandardGranularities(props.availableGranularities)
            : filterFiscalGranularities(props.availableGranularities)
        : props.availableGranularities;

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
            const isFiscal = showTabs && selectedTab === "fiscal";

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
        // Dropdown component does not expose isOpened prop but it mounts
        // this component every time it is opened and un-mounts when closed
        if (props.isMobile) {
            if (isAbsoluteDateFilterForm(props.selectedFilterOption)) {
                changeRoute("absoluteForm");
            } else if (isRelativeDateFilterForm(props.selectedFilterOption)) {
                changeRoute("relativeForm");
            }
        }
    }, [props.isMobile, props.selectedFilterOption]);

    const calculateHeight = (showExcludeCurrent: boolean): number | undefined => {
        // Mobile in Horizontal Layout
        if (window.innerHeight <= MOBILE_WIDTH) {
            const excludeOpenPeriodHeight = showExcludeCurrent ? EXCLUDE_OPEN_PERIOD_HEIGHT : 0;
            return window.innerHeight - excludeOpenPeriodHeight - ACTIONS_BUTTONS_HEIGHT - MARGIN_BOTTOM;
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

    const showExcludeCurrent: boolean = !isMobile || isExcludeCurrentPeriodEnabled;
    const bodyHeight = calculateHeight(showExcludeCurrent);
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
            className={cx(
                !isMobile && "gd-extended-date-filter-body-redesigned",
                "gd-extended-date-filter-body",
                "s-extended-date-filters-body",
                isMobile && "gd-extended-date-filter-body-mobile",
                route && "gd-active-form",
            )}
            onKeyDown={handleKeyDown}
            role={"dialog"}
            id={formId}
            aria-label={formLabel}
        >
            {route === null && isMobile ? (
                <div
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
                    role="listbox"
                    aria-label={intl.formatMessage({ id: "dateFilterDropdown.label" })}
                    className={cx("gd-extended-date-filter-body-wrapper", {
                        "gd-extended-date-filter-body-wrapper-wide":
                            isRelativeDateFilterForm(selectedFilterOption),
                    })}
                    style={wrapperStyle}
                >
                    {isEditMode && !isMobile && showHeaderMessage ? <EditModeMessage /> : null}
                    {isMobile ? (
                        <DateFilterBodyMobileContent
                            filterOptions={filterOptions}
                            selectedFilterOption={selectedFilterOption}
                            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                            isMobile={isMobile}
                            route={route}
                            closeDropdown={closeDropdown}
                            onApplyClick={onApplyClick}
                            onBack={handleBackNavigation}
                            dateFormat={dateFormat}
                            errors={errors || undefined}
                            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                            weekStart={weekStart}
                            availableGranularities={availableGranularities}
                            withoutApply={withoutApply}
                            isRedesigned
                            activeCalendars={props.activeCalendars}
                        />
                    ) : (
                        <VisibleScrollbar className={visibleScrollbarClassName} style={scrollerStyle}>
                            <DateFilterBodyContentFiltered
                                filterOptions={filterOptions}
                                selectedFilterOption={selectedFilterOption}
                                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                isMobile={isMobile}
                                dateFormat={dateFormat}
                                showTabs={showTabs}
                                selectedTab={selectedTab}
                                onTabSelect={setSelectedTab}
                                filteredRelativePreset={filteredRelativePreset}
                            />
                        </VisibleScrollbar>
                    )}
                </div>
            )}

            {showExcludeCurrent && !route ? (
                <ExcludeCurrentPeriodToggle
                    value={excludeCurrentPeriod}
                    onChange={onExcludeCurrentPeriodChange}
                    disabled={!isExcludeCurrentPeriodEnabled}
                    granularity={getDateFilterOptionGranularity(selectedFilterOption)}
                />
            ) : null}

            {/* New section for form buttons */}
            {hasFormOptions && !route ? (
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
            ) : null}

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
                            "gd-button-secondary gd-button-small",
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
                            className="gd-button-action gd-button-small s-date-filter-apply"
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

DateFilterBodyRedesigned.displayName = "DateFilterBodyRedesigned";
