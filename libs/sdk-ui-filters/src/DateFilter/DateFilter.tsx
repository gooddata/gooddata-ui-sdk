// (C) 2007-2025 GoodData Corporation
import React, { ComponentType } from "react";

import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import noop from "lodash/noop.js";

import { DateFilterGranularity, WeekStart, isAbsoluteDateFilterForm } from "@gooddata/sdk-model";
import { OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { DEFAULT_DATE_FORMAT } from "./constants/Platform.js";
import { IFilterConfigurationProps } from "./DateFilterBody/types.js";
import { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import { DateFilterCore } from "./DateFilterCore.js";
import {
    DateFilterOption,
    IDateFilterOptionsByType,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";
import { normalizeSelectedFilterOption } from "./utils/FilterOptionNormalization.js";
import { canExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { validateFilterOption } from "./validation/OptionValidation.js";
import { IFilterButtonCustomIcon, VisibilityMode } from "../shared/index.js";

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
 * @public
 */
export interface IDateFilterOwnProps extends IDateFilterStatePropsIntersection {
    filterOptions: IDateFilterOptionsByType;
    availableGranularities: DateFilterGranularity[];
    isEditMode?: boolean;
    openOnInit?: boolean;
    customFilterName?: string;
    dateFilterMode: VisibilityMode;
    dateFormat?: string;
    locale?: string;
    isTimeForAbsoluteRangeEnabled?: boolean;
    showDropDownHeaderMessage?: boolean;
    weekStart?: WeekStart;
    /**
     * Represents a custom icon with associated tooltip information.
     *
     * @alpha
     */
    customIcon?: IFilterButtonCustomIcon;

    /**
     * Represents a custom component for configuration.
     *
     * @alpha
     */
    FilterConfigurationComponent?: React.ComponentType<IFilterConfigurationProps>;

    /**
     * This enables filter mode without apply button.
     * If true, it is responsibility of a client, to appy filters when needed.
     * Typically uses onSelect callback to catch filter state.
     * Note, onApply callback is not called when this is true.
     *
     * @alpha
     */
    withoutApply?: boolean;

    /**
     * Working filter option used for synchronization inner filter state with outer given state.
     * Makes a controlled component state out of this.
     *
     * @alpha
     * @deprecated dont use. Will be removed in future releases.
     */
    workingSelectedFilterOption?: DateFilterOption;

    /**
     * Working filter exclude current period used for synchronization inner filter state with outer given state.
     * Makes a controlled component state out of this.
     *
     * @alpha
     * @deprecated dont use. Will be removed in future releases.
     */
    workingExcludeCurrentPeriod?: boolean;

    /**
     * If new apply all filters at once mode is enabled
     * @deprecated dont use. Will be removed in future releases. Use `withoutApply` instead
     */
    enableDashboardFiltersApplyModes?: boolean;

    /**
     * Specify custom button component
     *
     * @alpha
     */
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
}

/**
 * Callback props of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterCallbackProps {
    onApply: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
    onSelect?: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
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
    initWorkingExcludeCurrentPeriod: boolean;
    initWorkingSelectedFilterOption: DateFilterOption;
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
        withoutApply: false,
    };

    public static getDerivedStateFromProps(
        nextProps: IDateFilterProps,
        prevState: IDateFilterState,
    ): IDateFilterState {
        const withoutApply = nextProps.withoutApply ?? nextProps.enableDashboardFiltersApplyModes;
        if (
            withoutApply &&
            nextProps.workingSelectedFilterOption &&
            nextProps.excludeCurrentPeriod !== undefined &&
            (!isEqual(nextProps.workingSelectedFilterOption, prevState.initWorkingSelectedFilterOption) ||
                nextProps.excludeCurrentPeriod !== prevState.initWorkingExcludeCurrentPeriod)
        ) {
            return DateFilter.getStateFromWorkingProps(nextProps);
        }
        if (
            !isEqual(nextProps.selectedFilterOption, prevState.initSelectedFilterOption) ||
            nextProps.excludeCurrentPeriod !== prevState.initExcludeCurrentPeriod
        ) {
            return DateFilter.getStateFromProps(nextProps);
        }

        return null;
    }

    private static getStateFromProps(props: IDateFilterProps): IDateFilterState {
        const canExcludeCurrent = canExcludeCurrentPeriod(props.selectedFilterOption);
        return {
            initSelectedFilterOption: props.selectedFilterOption,
            selectedFilterOption: props.selectedFilterOption,
            initExcludeCurrentPeriod: props.excludeCurrentPeriod,
            excludeCurrentPeriod: canExcludeCurrent ? props.excludeCurrentPeriod : false,
            isExcludeCurrentPeriodEnabled: canExcludeCurrent,
            initWorkingSelectedFilterOption: props.workingSelectedFilterOption ?? props.selectedFilterOption,
            initWorkingExcludeCurrentPeriod: props.workingExcludeCurrentPeriod ?? props.excludeCurrentPeriod,
        };
    }

    private static getStateFromWorkingProps(props: IDateFilterProps): IDateFilterState {
        const selectedFilterOption = props.workingSelectedFilterOption ?? props.selectedFilterOption;
        const canExcludeCurrent = canExcludeCurrentPeriod(selectedFilterOption);
        return {
            ...DateFilter.getStateFromProps(props),
            selectedFilterOption: selectedFilterOption,
            excludeCurrentPeriod: canExcludeCurrent
                ? (props.workingExcludeCurrentPeriod ?? props.excludeCurrentPeriod)
                : false,
            initWorkingExcludeCurrentPeriod: props.workingExcludeCurrentPeriod ?? props.excludeCurrentPeriod,
            initWorkingSelectedFilterOption: selectedFilterOption,
            initExcludeCurrentPeriod: props.excludeCurrentPeriod,
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
            openOnInit,
            locale,
            isTimeForAbsoluteRangeEnabled,
            weekStart,
            customIcon,
            showDropDownHeaderMessage,
            FilterConfigurationComponent,
            withoutApply: withoutApplyProp,
            enableDashboardFiltersApplyModes,
            ButtonComponent,
            overlayPositionType,
            improveAccessibility,
        } = this.props;
        const withoutApply = withoutApplyProp ?? enableDashboardFiltersApplyModes;
        const { excludeCurrentPeriod, selectedFilterOption, isExcludeCurrentPeriodEnabled } = this.state;
        return dateFilterMode === "hidden" ? null : (
            <DateFilterCore
                availableGranularities={availableGranularities}
                customFilterName={customFilterName}
                dateFormat={dateFormat}
                openOnInit={openOnInit}
                showDropDownHeaderMessage={showDropDownHeaderMessage}
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
                customIcon={customIcon}
                FilterConfigurationComponent={FilterConfigurationComponent}
                withoutApply={withoutApply}
                ButtonComponent={ButtonComponent}
                overlayPositionType={overlayPositionType}
                improveAccessibility={improveAccessibility}
            />
        );
    }

    private handleApplyClick = () => {
        const normalizedSelectedFilterOption = normalizeSelectedFilterOption(this.state.selectedFilterOption);
        this.props.onApply(normalizedSelectedFilterOption, this.state.excludeCurrentPeriod);
    };

    private onChangesDiscarded = () => {
        if (!this.props.withoutApply) {
            this.setState(() => DateFilter.getStateFromProps(this.props), this.handleSelectChange);
        } else if (
            this.props.withoutApply &&
            !isEmpty(validateFilterOption(this.state.selectedFilterOption))
        ) {
            this.setState(() => DateFilter.getStateFromWorkingProps(this.props));
        }
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
        this.setState({ excludeCurrentPeriod }, this.handleSelectChange);
    };

    private handleSelectedFilterOptionChange = (selectedFilterOption: DateFilterOption) => {
        this.setState(
            (state) =>
                DateFilter.getStateFromSelectedOption(selectedFilterOption, state.excludeCurrentPeriod),
            this.handleSelectChange,
        );
    };

    private handleSelectChange = () => {
        const normalizedSelectedFilterOption = normalizeSelectedFilterOption(this.state.selectedFilterOption);
        if (isEmpty(validateFilterOption(normalizedSelectedFilterOption))) {
            this.props.onSelect?.(normalizedSelectedFilterOption, this.state.excludeCurrentPeriod);
        }
    };
}
