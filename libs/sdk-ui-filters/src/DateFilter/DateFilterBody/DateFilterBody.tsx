// (C) 2007-2022 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import cx from "classnames";
import { FormattedMessage } from "react-intl";

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
import { AbsolutePresetFilterItems } from "./AbsolutePresetFilterItems.js";
import { DateFilterRoute } from "./types.js";
import {
    DateFilterGranularity,
    isAbsoluteDateFilterForm,
    isRelativeDateFilterForm,
    WeekStart,
} from "@gooddata/sdk-model";

const ACTIONS_BUTTONS_HEIGHT = 53;
const EXCLUDE_OPEN_PERIOD_HEIGHT = 30; // height of 'Exclude open period' checkbox component
const MARGIN_BOTTOM = 8;
const MOBILE_WIDTH = 414; // iPhone 11 Pro Max

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

    onApplyClick: () => void;
    onCancelClick: () => void;
    closeDropdown: () => void;

    errors?: IExtendedDateFilterErrors;
    dateFilterButton: JSX.Element;

    weekStart?: WeekStart;
}

interface IDateFilterBodyState {
    route: DateFilterRoute;
}

const ITEM_CLASS_MOBILE = "gd-date-filter-item-mobile";

export class DateFilterBody extends React.Component<IDateFilterBodyProps, IDateFilterBodyState> {
    public state: IDateFilterBodyState = {
        route: null,
    };

    public changeRoute = (route: IDateFilterBodyState["route"] = null): void => {
        this.setState({ route });
    };

    public componentDidMount(): void {
        // Dropdown component does not expose isOpened prop but it mounts
        // this component every time it is opened and un-mounts when closed
        if (this.props.isMobile) {
            if (isAbsoluteDateFilterForm(this.props.selectedFilterOption)) {
                this.changeRoute("absoluteForm");
            } else if (isRelativeDateFilterForm(this.props.selectedFilterOption)) {
                this.changeRoute("relativeForm");
            }
        }
    }

    public render() {
        const {
            isExcludeCurrentPeriodEnabled,
            isMobile,
            isEditMode,
            onApplyClick,
            onCancelClick,
            closeDropdown,
            selectedFilterOption,
            dateFilterButton,
            errors,
        } = this.props;
        const { route } = this.state;

        const showExcludeCurrent: boolean = !isMobile || isExcludeCurrentPeriodEnabled;
        const bodyHeight: number = this.calculateHeight(showExcludeCurrent);
        let wrapperStyle: React.CSSProperties = {};
        let scrollerStyle: React.CSSProperties = {};
        if (bodyHeight) {
            // display: flex causes the scroller is cut off when scrolling
            wrapperStyle = { display: "block", height: `${bodyHeight}px` };
            scrollerStyle = { minHeight: `${bodyHeight}px` };
        }

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
                    <div
                        className={cx("gd-extended-date-filter-body-wrapper", {
                            "gd-extended-date-filter-body-wrapper-wide":
                                isRelativeDateFilterForm(selectedFilterOption),
                        })}
                        style={wrapperStyle}
                    >
                        {isEditMode && !isMobile ? <EditModeMessage /> : null}
                        {isMobile ? (
                            this.renderMobileContent()
                        ) : (
                            <VisibleScrollbar
                                className="gd-extended-date-filter-body-scrollable"
                                style={scrollerStyle}
                            >
                                {this.renderDefaultContent()}
                            </VisibleScrollbar>
                        )}
                    </div>
                    {showExcludeCurrent ? this.renderExcludeCurrent() : null}
                    <div className={cx("gd-extended-date-filter-actions")}>
                        <div className="gd-extended-date-filter-actions-buttons">
                            <DateFilterBodyButton
                                messageId="cancel"
                                className="gd-button-secondary gd-button-small s-date-filter-cancel"
                                onClick={() => {
                                    onCancelClick();
                                    closeDropdown();
                                }}
                            />
                            <DateFilterBodyButton
                                messageId="apply"
                                className="gd-button-action gd-button-small s-date-filter-apply"
                                disabled={!isEmpty(errors)}
                                onClick={() => {
                                    onApplyClick();
                                    closeDropdown();
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderAllTime = () => {
        const { filterOptions, isMobile, selectedFilterOption, onSelectedFilterOptionChange } = this.props;
        return filterOptions.allTime ? (
            <AllTimeFilterItem
                filterOption={filterOptions.allTime}
                selectedFilterOption={selectedFilterOption}
                onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                className={isMobile ? ITEM_CLASS_MOBILE : undefined}
            />
        ) : null;
    };

    private renderAbsoluteForm = () => {
        const {
            dateFormat,
            filterOptions,
            selectedFilterOption,
            onSelectedFilterOptionChange,
            isTimeForAbsoluteRangeEnabled,
            isMobile,
            errors,
            weekStart,
        } = this.props;

        if (!filterOptions.absoluteForm) {
            return null;
        }

        const { route } = this.state;
        const isSelected =
            filterOptions.absoluteForm.localIdentifier === selectedFilterOption.localIdentifier;
        const isOnRoute = route === "absoluteForm";
        return (
            <>
                {!isMobile || !isOnRoute ? (
                    <ListItem
                        isSelected={isSelected}
                        onClick={() => {
                            this.changeRoute("absoluteForm");
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

    private renderRelativeForm = () => {
        const {
            filterOptions,
            selectedFilterOption,
            onSelectedFilterOptionChange,
            availableGranularities,
            isMobile,
        } = this.props;

        if (!filterOptions.relativeForm) {
            return null;
        }
        const { route } = this.state;
        const isSelected =
            filterOptions.relativeForm.localIdentifier === selectedFilterOption.localIdentifier;
        const isOnRoute = route === "relativeForm";

        return (
            <>
                {!isMobile || !isOnRoute ? (
                    <ListItem
                        isSelected={isSelected}
                        onClick={() => {
                            this.changeRoute("relativeForm");
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
                    <DateFilterFormWrapper isMobile={isMobile}>
                        <RelativeDateFilterForm
                            onSelectedFilterOptionChange={(option) => {
                                onSelectedFilterOptionChange(option);
                            }}
                            selectedFilterOption={selectedFilterOption as IUiRelativeDateFilterForm}
                            availableGranularities={availableGranularities}
                            isMobile={isMobile}
                        />
                    </DateFilterFormWrapper>
                ) : null}
            </>
        );
    };

    private renderAbsolutePreset = () => {
        const { dateFormat, filterOptions, selectedFilterOption, onSelectedFilterOptionChange, isMobile } =
            this.props;
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

    private renderRelativePreset = () => {
        const { dateFormat, filterOptions, selectedFilterOption, onSelectedFilterOptionChange, isMobile } =
            this.props;
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

    private renderExcludeCurrent = () => {
        const {
            selectedFilterOption,
            onExcludeCurrentPeriodChange,
            excludeCurrentPeriod,
            isExcludeCurrentPeriodEnabled,
        } = this.props;
        return (
            <ExcludeCurrentPeriodToggle
                value={excludeCurrentPeriod}
                onChange={onExcludeCurrentPeriodChange}
                disabled={!isExcludeCurrentPeriodEnabled}
                granularity={getDateFilterOptionGranularity(selectedFilterOption)}
            />
        );
    };

    private renderMobileContent() {
        const { route } = this.state;
        if (route === "absoluteForm") {
            return (
                <>
                    <DateFilterHeader changeRoute={this.changeRoute}>
                        <FormattedMessage id="filters.staticPeriod" />
                    </DateFilterHeader>
                    {this.renderAbsoluteForm()}
                </>
            );
        }
        if (route === "relativeForm") {
            return isEmpty(this.props.availableGranularities) ? null : (
                <>
                    <DateFilterHeader changeRoute={this.changeRoute}>
                        <FormattedMessage id="filters.floatingRange" />
                    </DateFilterHeader>
                    {this.renderRelativeForm()}
                </>
            );
        }
        return this.renderDefaultContent();
    }

    private renderDefaultContent() {
        return (
            <>
                {this.renderAllTime()}
                {this.renderAbsoluteForm()}
                {!isEmpty(this.props.availableGranularities) ? this.renderRelativeForm() : null}
                {this.renderAbsolutePreset()}
                {this.renderRelativePreset()}
            </>
        );
    }

    private calculateHeight = (showExcludeCurrent: boolean): number => {
        // Mobile in Horizontal Layout
        if (window.innerHeight <= MOBILE_WIDTH) {
            const excludeOpenPeriodHeight = showExcludeCurrent ? EXCLUDE_OPEN_PERIOD_HEIGHT : 0;
            return window.innerHeight - excludeOpenPeriodHeight - ACTIONS_BUTTONS_HEIGHT - MARGIN_BOTTOM;
        }
        return undefined;
    };
}
