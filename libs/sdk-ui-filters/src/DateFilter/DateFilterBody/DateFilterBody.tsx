// (C) 2007-2025 GoodData Corporation
import React, { useState, useEffect, useRef, useCallback } from "react";
import isEmpty from "lodash/isEmpty.js";
import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { ListItem } from "../ListItem/ListItem.js";
import {
    IExtendedDateFilterErrors,
    IDateFilterOptionsByType,
    DateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
} from "../interfaces/index.js";
import { ExcludeCurrentPeriodToggle } from "../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggle.js";
import { VisibleScrollbar } from "../VisibleScrollbar/VisibleScrollbar.js";
import { getDateFilterOptionGranularity } from "../utils/OptionUtils.js";
import { AllTimeFilterItem } from "./AllTimeFilterItem.js";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper/DateFilterFormWrapper.js";
import { AbsoluteDateFilterForm } from "../AbsoluteDateFilterForm/AbsoluteDateFilterForm.js";
import { ListItemTooltip } from "../ListItemTooltip/ListItemTooltip.js";
import { RelativeDateFilterForm } from "../RelativeDateFilterForm/RelativeDateFilterForm.js";
import { RelativePresetFilterItems } from "./RelativePresetFilterItems.js";
import { EditModeMessage } from "./EditModeMessage.js";
import { DateFilterHeader } from "./DateFilterHeader.js";
import { DateFilterBodyButton } from "./DateFilterBodyButton.js";
import { DateFilterConfigurationButton } from "./DateFilterConfigurationButton.js";
import { AbsolutePresetFilterItems } from "./AbsolutePresetFilterItems.js";
import { DateFilterRoute } from "./types.js";
import {
    DateFilterGranularity,
    isAbsoluteDateFilterForm,
    isRelativeDateFilterForm,
    WeekStart,
} from "@gooddata/sdk-model";
import {
    DATE_FILTER_APPLY_BUTTON_ID,
    DATE_FILTER_CANCEL_BUTTON_ID,
    DATE_FILTER_INPUT_HECKBOX_ID,
    DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID,
    DATE_FILTER_RELATIVE_PERIOD_WRAPPER_SELECT_MENU_ID,
} from "../utils/accessibility/elementId.js";
import { getFocusableElements, makeMenuKeyboardNavigation, UiFocusTrap, useId } from "@gooddata/sdk-ui-kit";

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

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

export const DateFilterBody = React.forwardRef<HTMLDivElement, IDateFilterBodyProps>((props, ref) => {
    const [route, setRoute] = useState<DateFilterRoute>(null);
    const relativeDateFilterRef = useRef<HTMLDivElement>(null);
    const tabGranularityRef = useRef<HTMLDivElement>(null);

    const relativeDateFilterId = useId();

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

    const renderAllTime = () => {
        const { filterOptions, isMobile, selectedFilterOption, onSelectedFilterOptionChange } = props;
        return filterOptions.allTime ? (
            <AllTimeFilterItem
                filterOption={filterOptions.allTime}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                className={isMobile ? ITEM_CLASS_MOBILE : undefined}
            />
        ) : null;
    };

    const renderAbsoluteForm = () => {
        const {
            dateFormat,
            filterOptions,
            selectedFilterOption,
            onSelectedFilterOptionChange,
            isTimeForAbsoluteRangeEnabled,
            isMobile,
            errors,
            weekStart,
        } = props;

        if (!filterOptions.absoluteForm) {
            return null;
        }

        const isSelected =
            filterOptions.absoluteForm.localIdentifier === selectedFilterOption.localIdentifier;
        const isOnRoute = route === "absoluteForm";
        return (
            <>
                {!isMobile || !isOnRoute ? (
                    <ListItem
                        isSelected={isSelected}
                        onClick={() => {
                            changeRoute("absoluteForm");
                            if (!isAbsoluteDateFilterForm(selectedFilterOption)) {
                                onSelectedFilterOptionChange(filterOptions.absoluteForm);
                            }
                        }}
                        className={cx(
                            "s-absolute-form",
                            "s-do-not-close-dropdown-on-click",
                            isMobile && ITEM_CLASS_MOBILE,
                        )}
                    >
                        {filterOptions.absoluteForm.name ? (
                            filterOptions.absoluteForm.name
                        ) : (
                            <FormattedMessage id="filters.staticPeriod" />
                        )}
                    </ListItem>
                ) : null}
                {isSelected && (!isMobile || isOnRoute) ? (
                    <DateFilterFormWrapper isMobile={isMobile}>
                        <AbsoluteDateFilterForm
                            dateFormat={dateFormat}
                            errors={errors?.absoluteForm || undefined}
                            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                            selectedFilterOption={selectedFilterOption as IUiAbsoluteDateFilterForm}
                            isMobile={isMobile}
                            isTimeEnabled={isTimeForAbsoluteRangeEnabled}
                            weekStart={weekStart}
                        />
                    </DateFilterFormWrapper>
                ) : null}
            </>
        );
    };

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, closeDropdown: () => void) => {
            if (!tabGranularityRef.current) return;

            const items = Array.from(tabGranularityRef.current.querySelectorAll("[tabindex]"));
            const activeElement = document.activeElement as HTMLElement;
            const currentIndex = items.findIndex((item) => item === activeElement);
            const keyboardHandler = makeMenuKeyboardNavigation({
                onFocusNext: (event) => {
                    event.stopPropagation();
                },
                onFocusPrevious: (event) => {
                    event.stopPropagation();
                },
                onLeaveLevel: () => {
                    const previousElement =
                        currentIndex <= 0 ? items[items.length - 1] : items[currentIndex - 1];

                    (previousElement as HTMLElement)?.focus();
                },
                onEnterLevel: () => {
                    const nextElement =
                        currentIndex === items.length - 1 ? items[0] : items[currentIndex + 1];

                    (nextElement as HTMLElement)?.focus();
                },
                onFocusFirst: () => {
                    const { firstElement } = getFocusableElements(tabGranularityRef.current);
                    firstElement?.focus();
                },
                onFocusLast: () => {
                    const { lastElement } = getFocusableElements(tabGranularityRef.current);
                    lastElement?.focus();
                },
                onClose: () => {
                    const isMenuSelectOpen = document.getElementById(
                        DATE_FILTER_RELATIVE_PERIOD_WRAPPER_SELECT_MENU_ID,
                    );
                    if (!isMenuSelectOpen) {
                        closeDropdown();
                    }
                },
                onUnhandledKeyDown: (event) => {
                    if (event.key !== "Tab") {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    const focusableElementsSelector = [
                        'input:not(:disabled):not([aria-disabled="true"])',
                        '[tabindex]:not([tabindex="-1"]):not(:disabled):not([aria-disabled="true"])',
                    ].join(",");

                    const focusableElements = Array.from(
                        relativeDateFilterRef.current.querySelectorAll<HTMLElement>(
                            focusableElementsSelector,
                        ),
                    );

                    const active = document.activeElement as HTMLElement;
                    const elements = Array.from(focusableElements);
                    const currentIndex = elements.indexOf(active);

                    if (currentIndex === elements.length - 1) {
                        const focusIds = [
                            DATE_FILTER_INPUT_HECKBOX_ID,
                            DATE_FILTER_CANCEL_BUTTON_ID,
                            DATE_FILTER_APPLY_BUTTON_ID,
                        ];

                        const focusElements = focusIds
                            .map((id) => document.getElementById(id))
                            .filter((el) => el && !el.hasAttribute("disabled"));

                        focusElements[0]?.focus();
                    }

                    if (currentIndex !== -1) {
                        const direction = event.shiftKey ? -1 : 1;
                        const nextIndex = (currentIndex + direction + elements.length) % elements.length;

                        elements[nextIndex].focus();
                    }
                },
            });

            keyboardHandler(event);
        },
        [relativeDateFilterRef, tabGranularityRef],
    );

    const renderRelativeForm = () => {
        const {
            filterOptions,
            selectedFilterOption,
            onSelectedFilterOptionChange,
            availableGranularities,
            closeDropdown,
            isMobile,
        } = props;

        if (!filterOptions.relativeForm) {
            return null;
        }
        const isSelected =
            filterOptions.relativeForm.localIdentifier === selectedFilterOption.localIdentifier;
        const isOnRoute = route === "relativeForm";

        return (
            <>
                {!isMobile || !isOnRoute ? (
                    <ListItem
                        isSelected={isSelected}
                        onClick={() => {
                            changeRoute("relativeForm");
                            if (!isRelativeDateFilterForm(selectedFilterOption)) {
                                onSelectedFilterOptionChange(filterOptions.relativeForm);
                            }
                        }}
                        className={cx(
                            "s-relative-form",
                            "s-do-not-close-dropdown-on-click",
                            isMobile && ITEM_CLASS_MOBILE,
                        )}
                    >
                        {filterOptions.relativeForm.name ? (
                            filterOptions.relativeForm.name
                        ) : (
                            <FormattedMessage id="filters.floatingRange" />
                        )}
                        {!isMobile ? (
                            <ListItemTooltip bubbleAlignPoints={[{ align: "cr cl" }]}>
                                <FormattedMessage id="filters.floatingRange.tooltip" />
                            </ListItemTooltip>
                        ) : null}
                    </ListItem>
                ) : null}

                {isSelected && (!isMobile || isOnRoute) ? (
                    <UiFocusTrap autofocusOnOpen initialFocus={DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID}>
                        <DateFilterFormWrapper isMobile={isMobile}>
                            <div
                                ref={relativeDateFilterRef}
                                onKeyDown={(e) => handleKeyDown(e, closeDropdown)}
                            >
                                <RelativeDateFilterForm
                                    onSelectedFilterOptionChange={(option) => {
                                        onSelectedFilterOptionChange(option);
                                    }}
                                    selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                                    availableGranularities={availableGranularities}
                                    isMobile={isMobile}
                                    ref={tabGranularityRef}
                                    relativeDateFilterId={relativeDateFilterId}
                                />
                            </div>
                        </DateFilterFormWrapper>
                    </UiFocusTrap>
                ) : null}
            </>
        );
    };

    const renderAbsolutePreset = () => {
        const { dateFormat, filterOptions, selectedFilterOption, onSelectedFilterOptionChange, isMobile } =
            props;
        return filterOptions.absolutePreset && filterOptions.absolutePreset.length > 0 ? (
            <AbsolutePresetFilterItems
                dateFormat={dateFormat}
                filterOptions={filterOptions.absolutePreset}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                className={isMobile ? ITEM_CLASS_MOBILE : undefined}
            />
        ) : null;
    };

    const renderRelativePreset = () => {
        const { dateFormat, filterOptions, selectedFilterOption, onSelectedFilterOptionChange, isMobile } =
            props;
        return filterOptions.relativePreset ? (
            <RelativePresetFilterItems
                dateFormat={dateFormat}
                filterOption={filterOptions.relativePreset}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                className={isMobile ? ITEM_CLASS_MOBILE : undefined}
            />
        ) : null;
    };

    const renderExcludeCurrent = () => {
        const {
            selectedFilterOption,
            onExcludeCurrentPeriodChange,
            excludeCurrentPeriod,
            isExcludeCurrentPeriodEnabled,
        } = props;
        return (
            <ExcludeCurrentPeriodToggle
                value={excludeCurrentPeriod}
                onChange={onExcludeCurrentPeriodChange}
                disabled={!isExcludeCurrentPeriodEnabled}
                granularity={getDateFilterOptionGranularity(selectedFilterOption)}
            />
        );
    };

    const renderMobileContent = () => {
        if (route === "absoluteForm") {
            return (
                <>
                    <DateFilterHeader changeRoute={changeRoute}>
                        <FormattedMessage id="filters.staticPeriod" />
                    </DateFilterHeader>
                    {renderAbsoluteForm()}
                </>
            );
        }
        if (route === "relativeForm") {
            return isEmpty(props.availableGranularities) ? null : (
                <>
                    <DateFilterHeader changeRoute={changeRoute}>
                        <FormattedMessage id="filters.floatingRange" />
                    </DateFilterHeader>
                    {renderRelativeForm()}
                </>
            );
        }
        return renderDefaultContent();
    };

    const renderDefaultContent = () => {
        return (
            <>
                {renderAllTime()}
                {renderAbsoluteForm()}
                {!isEmpty(props.availableGranularities) ? renderRelativeForm() : null}
                {renderAbsolutePreset()}
                {renderRelativePreset()}
            </>
        );
    };

    const renderDateFilterBody = () => {
        const {
            isExcludeCurrentPeriodEnabled,
            isMobile,
            isEditMode,
            selectedFilterOption,
            showHeaderMessage = true,
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
            <>
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
                        renderMobileContent()
                    ) : (
                        <VisibleScrollbar className={visibleScrollbarClassName} style={scrollerStyle}>
                            {renderDefaultContent()}
                        </VisibleScrollbar>
                    )}
                </div>
            </>
        );
    };

    const {
        isExcludeCurrentPeriodEnabled,
        isMobile,
        onApplyClick,
        onCancelClick,
        closeDropdown,
        onConfigurationClick,
        dateFilterButton,
        errors,
        isConfigurationEnabled,
        withoutApply,
    } = props;

    const showExcludeCurrent: boolean = !isMobile || isExcludeCurrentPeriodEnabled;

    return (
        <div className="gd-extended-date-filter-container">
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
                {renderDateFilterBody()}
                {showExcludeCurrent ? renderExcludeCurrent() : null}

                <div className={cx("gd-extended-date-filter-actions")}>
                    <div className="gd-extended-date-filter-actions-left-content">
                        {isConfigurationEnabled ? (
                            <DateFilterConfigurationButton onConfiguration={onConfigurationClick} />
                        ) : null}
                    </div>
                    <div className="gd-extended-date-filter-actions-buttons">
                        <DateFilterBodyButton
                            id={DATE_FILTER_CANCEL_BUTTON_ID}
                            messageId={withoutApply ? "close" : "cancel"}
                            className="gd-button-secondary gd-button-small s-date-filter-cancel"
                            onClick={() => {
                                onCancelClick();
                                closeDropdown();
                            }}
                        />
                        {!withoutApply && (
                            <DateFilterBodyButton
                                id={DATE_FILTER_APPLY_BUTTON_ID}
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
        </div>
    );
});

DateFilterBody.displayName = "DateFilterBody";
