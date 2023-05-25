// (C) 2007-2022 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import noop from "lodash/noop.js";
import {
    DateFilterGranularity,
    isAbsoluteDateFilterForm,
    DashboardDateFilterConfigMode,
    WeekStart,
} from "@gooddata/sdk-model";
import { canExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";

import { DateFilterCore } from "./DateFilterCore.js";
import { validateFilterOption } from "./validation/OptionValidation.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";
import { DEFAULT_DATE_FORMAT } from "./constants/Platform.js";
import { normalizeSelectedFilterOption } from "./utils/FilterOptionNormalization.js";

/**
 * Props of the {@link DateFilter} component that are reflected in the state.
 *
 * @public
 */
export interface IDateFilterStatePropsIntersection {
    excludeCurrentPeriod: boolean;
    selectedFilterOption: DateFilterOption;
}

/**
 * Props of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterOwnProps extends IDateFilterStatePropsIntersection {
    filterOptions: IDateFilterOptionsByType;
    availableGranularities: DateFilterGranularity[];
    isEditMode?: boolean;
    customFilterName?: string;
    dateFilterMode: DashboardDateFilterConfigMode;
    dateFormat?: string;
    locale?: string;
    isTimeForAbsoluteRangeEnabled?: boolean;
    weekStart?: WeekStart;
}

/**
 * Callback props of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterCallbackProps {
    onApply: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
    onCancel?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
}

/**
 * All the props of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterProps extends IDateFilterOwnProps, IDateFilterCallbackProps {}

/**
 * State of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterState extends IDateFilterStatePropsIntersection {
    initExcludeCurrentPeriod: boolean;
    initSelectedFilterOption: DateFilterOption;
    isExcludeCurrentPeriodEnabled: boolean;
}

/**
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/date_filter_component.html | DateFilter} is a component for configuring a date filter value.
 *
 * @public
 */
export class DateFilter extends React.PureComponent<IDateFilterProps, IDateFilterState> {
    public static defaultProps: Partial<IDateFilterProps> = {
        dateFormat: DEFAULT_DATE_FORMAT,
        isEditMode: false,
        isTimeForAbsoluteRangeEnabled: false,
        locale: "en-US",
        onCancel: noop,
        onOpen: noop,
        onClose: noop,
        weekStart: "Sunday" as const,
    };

    public static getDerivedStateFromProps(
        nextProps: IDateFilterProps,
        prevState: IDateFilterState,
    ): IDateFilterState {
        if (
            !isEqual(nextProps.selectedFilterOption, prevState.initSelectedFilterOption) ||
            nextProps.excludeCurrentPeriod !== prevState.initExcludeCurrentPeriod
        ) {
            return DateFilter.getStateFromProps(nextProps);
        }

        return null;
    }

    private static getStateFromProps(props: IDateFilterProps) {
        const canExcludeCurrent = canExcludeCurrentPeriod(props.selectedFilterOption);
        return {
            initSelectedFilterOption: props.selectedFilterOption,
            selectedFilterOption: props.selectedFilterOption,
            initExcludeCurrentPeriod: props.excludeCurrentPeriod,
            excludeCurrentPeriod: canExcludeCurrent ? props.excludeCurrentPeriod : false,
            isTimeForAbsoluteRangeEnabled: props.isTimeForAbsoluteRangeEnabled,
            isExcludeCurrentPeriodEnabled: canExcludeCurrent,
        };
    }

    private static getStateFromSelectedOption = (
        selectedFilterOption: DateFilterOption,
        excludeCurrentPeriod: boolean,
    ) => {
        const canExcludeCurrent = canExcludeCurrentPeriod(selectedFilterOption);
        return {
            selectedFilterOption,
            excludeCurrentPeriod: canExcludeCurrent ? excludeCurrentPeriod : false,
            isExcludeCurrentPeriodEnabled: canExcludeCurrent,
        };
    };

    private static checkInitialFilterOption = (filterOption: DateFilterOption) => {
        if (isAbsoluteDateFilterForm(filterOption) && (isNil(filterOption.from) || isNil(filterOption.to))) {
            console.warn(
                "The default filter option is not valid. Values 'from' and 'to' from absoluteForm filter option must be specified.",
            );
        }

        if (
            isUiRelativeDateFilterForm(filterOption) &&
            (isNil(filterOption.from) || isNil(filterOption.to))
        ) {
            console.warn(
                "The default filter option is not valid. Values 'from' and 'to' from relativeForm filter option must be specified.",
            );
        }
    };

    constructor(props: IDateFilterProps) {
        super(props);
        this.state = DateFilter.getStateFromProps(props);
    }

    public componentDidMount(): void {
        DateFilter.checkInitialFilterOption(this.props.selectedFilterOption);
    }

    public render() {
        const {
            customFilterName,
            dateFilterMode,
            dateFormat,
            filterOptions,
            selectedFilterOption: originalSelectedFilterOption,
            excludeCurrentPeriod: originalExcludeCurrentPeriod,
            availableGranularities,
            isEditMode,
            locale,
            isTimeForAbsoluteRangeEnabled,
            weekStart,
        } = this.props;
        const { excludeCurrentPeriod, selectedFilterOption, isExcludeCurrentPeriodEnabled } = this.state;
        return dateFilterMode === "hidden" ? null : (
            <DateFilterCore
                availableGranularities={availableGranularities}
                customFilterName={customFilterName}
                dateFormat={dateFormat}
                disabled={dateFilterMode === "readonly"}
                excludeCurrentPeriod={excludeCurrentPeriod}
                originalExcludeCurrentPeriod={originalExcludeCurrentPeriod}
                isExcludeCurrentPeriodEnabled={isExcludeCurrentPeriodEnabled}
                isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                isEditMode={isEditMode}
                filterOptions={filterOptions}
                selectedFilterOption={selectedFilterOption}
                originalSelectedFilterOption={originalSelectedFilterOption}
                locale={locale}
                onApplyClick={this.handleApplyClick}
                onCancelClick={this.onCancelClicked}
                onDropdownOpenChanged={this.onDropdownOpenChanged}
                onExcludeCurrentPeriodChange={this.handleExcludeCurrentPeriodChange}
                onSelectedFilterOptionChange={this.handleSelectedFilterOptionChange}
                errors={validateFilterOption(selectedFilterOption)}
                weekStart={weekStart}
            />
        );
    }

    private handleApplyClick = () => {
        const normalizedSelectedFilterOption = normalizeSelectedFilterOption(this.state.selectedFilterOption);
        this.props.onApply(normalizedSelectedFilterOption, this.state.excludeCurrentPeriod);
    };

    private onChangesDiscarded = () => {
        this.setState(() => DateFilter.getStateFromProps(this.props));
    };

    private onCancelClicked = () => {
        this.props.onCancel();
        this.onChangesDiscarded();
    };

    private onDropdownOpenChanged = (isOpen: boolean) => {
        if (isOpen) {
            this.props.onOpen();
        } else {
            this.props.onClose();
            this.onChangesDiscarded();
        }
    };

    private handleExcludeCurrentPeriodChange = (excludeCurrentPeriod: boolean) => {
        this.setState({ excludeCurrentPeriod });
    };

    private handleSelectedFilterOptionChange = (selectedFilterOption: DateFilterOption) => {
        this.setState((state) =>
            DateFilter.getStateFromSelectedOption(selectedFilterOption, state.excludeCurrentPeriod),
        );
    };
}
