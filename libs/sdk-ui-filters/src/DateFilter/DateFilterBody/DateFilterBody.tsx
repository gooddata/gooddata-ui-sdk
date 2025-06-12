// (C) 2007-2025 GoodData Corporation
import React, { useState, useEffect } from "react";
import isEmpty from "lodash/isEmpty.js";
import cx from "classnames";
import { useIntl } from "react-intl";

import {
    IExtendedDateFilterErrors,
    IDateFilterOptionsByType,
    DateFilterOption,
} from "../interfaces/index.js";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggle.js";
import { VisibleScrollbar } from "../VisibleScrollbar/VisibleScrollbar.js";
import { getDateFilterOptionGranularity } from "../utils/OptionUtils.js";

import { EditModeMessage } from "./EditModeMessage.js";
import { DateFilterBodyButton } from "./DateFilterBodyButton.js";
import { DateFilterConfigurationButton } from "./DateFilterConfigurationButton.js";
import { DateFilterRoute } from "./types.js";
import {
    DateFilterGranularity,
    isAbsoluteDateFilterForm,
    isRelativeDateFilterForm,
    WeekStart,
} from "@gooddata/sdk-model";

import { DateFilterBodyContent } from "./DateFilterBodyContent.js";
import { DateFilterBodyMobileContent } from "./DateFilterBodyMobileContent.js";

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
    dateFilterButton: JSX.Element;

    weekStart?: WeekStart;
    isConfigurationEnabled?: boolean;
    onConfigurationClick: () => void;

    withoutApply?: boolean;
}

export const DateFilterBody = React.forwardRef<HTMLDivElement, IDateFilterBodyProps>((props, ref) => {
    const [route, setRoute] = useState<DateFilterRoute>(null);

    const intl = useIntl();
    const changeRoute = (newRoute: DateFilterRoute = null): void => {
        setRoute(newRoute);
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

    return (
        <div
            className={cx(
                "gd-extended-date-filter-body",
                "s-extended-date-filters-body",
                isMobile && "gd-extended-date-filter-body-mobile",
            )}
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
                        changeRoute={changeRoute}
                        dateFormat={dateFormat}
                        errors={errors || undefined}
                        isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                        weekStart={weekStart}
                        availableGranularities={availableGranularities}
                    />
                ) : (
                    <VisibleScrollbar className={visibleScrollbarClassName} style={scrollerStyle}>
                        <DateFilterBodyContent
                            filterOptions={filterOptions}
                            selectedFilterOption={selectedFilterOption}
                            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                            isMobile={isMobile}
                            route={route}
                            closeDropdown={closeDropdown}
                            onApplyClick={onApplyClick}
                            changeRoute={changeRoute}
                            dateFormat={dateFormat}
                            errors={errors || undefined}
                            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                            weekStart={weekStart}
                            availableGranularities={availableGranularities}
                        />
                    </VisibleScrollbar>
                )}
            </div>
            {showExcludeCurrent ? (
                <ExcludeCurrentPeriodToggle
                    value={excludeCurrentPeriod}
                    onChange={onExcludeCurrentPeriodChange}
                    disabled={!isExcludeCurrentPeriodEnabled}
                    granularity={getDateFilterOptionGranularity(selectedFilterOption)}
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
                        className="gd-button-secondary gd-button-small s-date-filter-cancel"
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
});

DateFilterBody.displayName = "DateFilterBody";
