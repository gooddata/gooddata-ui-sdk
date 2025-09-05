// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useEffect, useState } from "react";

import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";
import { useIntl } from "react-intl";

import {
    DateFilterGranularity,
    WeekStart,
    isAbsoluteDateFilterForm,
    isRelativeDateFilterForm,
} from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DateFilterBodyButton } from "./DateFilterBodyButton.js";
import { DateFilterBodyContentFiltered } from "./DateFilterBodyContentFiltered.js";
import { DateFilterBodyMobileContent } from "./DateFilterBodyMobileContent.js";
import { DateFilterConfigurationButton } from "./DateFilterConfigurationButton.js";
import { DateFilterCustomPeriodButtons } from "./DateFilterCustomPeriodButtons.js";
import { DateFilterFormContent } from "./DateFilterFormContent.js";
import { EditModeMessage } from "./EditModeMessage.js";
import { DateFilterRoute } from "./types.js";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggle.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
} from "../interfaces/index.js";
import { getDateFilterOptionGranularity } from "../utils/OptionUtils.js";
import { VisibleScrollbar } from "../VisibleScrollbar/VisibleScrollbar.js";

const ACTIONS_BUTTONS_HEIGHT = 53;
const EXCLUDE_OPEN_PERIOD_HEIGHT = 30; // height of 'Exclude open period' checkbox component
const MARGIN_BOTTOM = 8;
const MOBILE_WIDTH = 414; // iPhone 11 Pro Max
const SMALL_SCREEN_HEIGHT = 640;

export interface IDateFilterBodyRedesignedProps {
    dateFormat: string;
    filterOptions: IDateFilterOptionsByType;
    selectedFilterOption: DateFilterOption;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;

    excludeCurrentPeriod: boolean;
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
}

export const DateFilterBodyRedesigned = React.forwardRef<HTMLDivElement, IDateFilterBodyRedesignedProps>(
    (props, ref) => {
        const [route, setRoute] = useState<DateFilterRoute>(null);
        // Refs for focus management when navigating back from forms
        // This ensures that when a user navigates back from a form using the back button,
        // focus is returned to the button that originally opened that form
        const absoluteButtonRef = React.useRef<HTMLButtonElement>(null);
        const relativeButtonRef = React.useRef<HTMLButtonElement>(null);

        const intl = useIntl();
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

            if (
                newForm === "relativeForm" &&
                filterOptions.relativeForm &&
                selectedFilterOption.localIdentifier !== filterOptions.relativeForm.localIdentifier
            ) {
                onSelectedFilterOptionChange(filterOptions.relativeForm);
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

        const calculateHeight = (showExcludeCurrent: boolean): number => {
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
            weekStart,
            availableGranularities,
            onApplyClick,
            onCancelClick,
            closeDropdown,
            onConfigurationClick,
            onExcludeCurrentPeriodChange,
            onSelectedFilterOptionChange,
        } = props;

        const showExcludeCurrent: boolean = !isMobile || isExcludeCurrentPeriodEnabled;
        const bodyHeight: number = calculateHeight(showExcludeCurrent);
        const visibleScrollbarClassName = getVisibleScrollbarClassName();
        let wrapperStyle: React.CSSProperties = {};
        let scrollerStyle: React.CSSProperties = {};
        if (bodyHeight) {
            // display: flex causes the scroller is cut off when scrolling
            wrapperStyle = { display: "block", height: `${bodyHeight}px` };
            scrollerStyle = { minHeight: `${bodyHeight}px` };
        }

        const hasFormOptions = !!(
            filterOptions.absoluteForm ||
            (filterOptions.relativeForm && availableGranularities.length > 0)
        );

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "ArrowLeft" && route) {
                e.preventDefault();
                e.stopPropagation();
                handleBackNavigation();
            }
        };

        const id = useIdPrefixed();

        const absoluteFormId = "absoluteForm" + id;
        const relativeFormId = "relativeForm" + id;

        const formId = route ? (route === "absoluteForm" ? absoluteFormId : relativeFormId) : undefined;

        const formLabel = route
            ? route === "absoluteForm"
                ? intl.formatMessage({ id: "filters.staticPeriod" })
                : intl.formatMessage({ id: "filters.floatingRange" })
            : undefined;

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
                role={route ? "dialog" : undefined}
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
                            availableGranularities={availableGranularities}
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
                                isRedesigned={true}
                            />
                        ) : (
                            <VisibleScrollbar className={visibleScrollbarClassName} style={scrollerStyle}>
                                <DateFilterBodyContentFiltered
                                    filterOptions={filterOptions}
                                    selectedFilterOption={selectedFilterOption}
                                    onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                                    isMobile={isMobile}
                                    dateFormat={dateFormat}
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

                <div className={cx("gd-extended-date-filter-actions")}>
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
    },
);

DateFilterBodyRedesigned.displayName = "DateFilterBodyRedesigned";
