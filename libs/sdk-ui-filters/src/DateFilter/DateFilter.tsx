// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import { ExtendedDateFilters } from "./interfaces/ExtendedDateFilters";
import { canExcludeCurrentPeriod } from "./utils/PeriodExlusion";

import { DateFilterCore } from "./DateFilterCore";
import { validateFilterOption } from "./validation/OptionValidation";

const normalizeSelectedFilterOption = (
    selectedFilterOption: ExtendedDateFilters.DateFilterOption,
): ExtendedDateFilters.DateFilterOption => {
    if (
        ExtendedDateFilters.isRelativeDateFilterForm(selectedFilterOption) &&
        selectedFilterOption.from > selectedFilterOption.to
    ) {
        return {
            ...selectedFilterOption,
            from: selectedFilterOption.to,
            to: selectedFilterOption.from,
        };
    }
    return selectedFilterOption;
};

interface IStatePropsIntersection {
    excludeCurrentPeriod: boolean;
    selectedFilterOption: ExtendedDateFilters.DateFilterOption;
}

export interface IDateFilterOwnProps extends IStatePropsIntersection {
    filterOptions: ExtendedDateFilters.IDateFilterOptionsByType;
    availableGranularities: ExtendedDateFilters.DateFilterGranularity[];
    isEditMode?: boolean;
    customFilterName?: string;
    dateFilterMode: ExtendedDateFilters.DateFilterConfigMode;
    locale?: string;
}

export interface IDateFilterCallbackProps {
    onApply: (dateFilterOption: ExtendedDateFilters.DateFilterOption, excludeCurrentPeriod: boolean) => void;
    onCancel?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
}

export interface IDateFilterProps extends IDateFilterOwnProps, IDateFilterCallbackProps {}

interface IDateFilterState extends IStatePropsIntersection {
    initExcludeCurrentPeriod: boolean;
    initSelectedFilterOption: ExtendedDateFilters.DateFilterOption;
    isExcludeCurrentPeriodEnabled: boolean;
}

export class DateFilter extends React.PureComponent<IDateFilterProps, IDateFilterState> {
    public static defaultProps: Partial<IDateFilterProps> = {
        isEditMode: false,
        locale: "en-US",
        onCancel: noop,
        onOpen: noop,
        onClose: noop,
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
            isExcludeCurrentPeriodEnabled: canExcludeCurrent,
        };
    }

    private static getStateFromSelectedOption = (
        selectedFilterOption: ExtendedDateFilters.DateFilterOption,
        excludeCurrentPeriod: boolean,
    ) => {
        const canExcludeCurrent = canExcludeCurrentPeriod(selectedFilterOption);
        return {
            selectedFilterOption,
            excludeCurrentPeriod: canExcludeCurrent ? excludeCurrentPeriod : false,
            isExcludeCurrentPeriodEnabled: canExcludeCurrent,
        };
    };

    constructor(props: IDateFilterProps) {
        super(props);
        this.state = DateFilter.getStateFromProps(props);

        // tslint:disable-next-line:no-console
        console.warn(
            "DateFilter component is still in beta. Component and its API may change in the future.",
        );
    }

    public render(): React.ReactNode {
        const {
            customFilterName,
            dateFilterMode,
            filterOptions,
            selectedFilterOption: originalSelectedFilterOption,
            excludeCurrentPeriod: originalExcludeCurrentPeriod,
            availableGranularities,
            isEditMode,
            locale,
        } = this.props;
        const { excludeCurrentPeriod, selectedFilterOption, isExcludeCurrentPeriodEnabled } = this.state;
        return dateFilterMode === "hidden" ? null : (
            <DateFilterCore
                availableGranularities={availableGranularities}
                customFilterName={customFilterName}
                disabled={dateFilterMode === "readonly"}
                excludeCurrentPeriod={excludeCurrentPeriod}
                originalExcludeCurrentPeriod={originalExcludeCurrentPeriod}
                isExcludeCurrentPeriodEnabled={isExcludeCurrentPeriodEnabled}
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

    private handleSelectedFilterOptionChange = (
        selectedFilterOption: ExtendedDateFilters.DateFilterOption,
    ) => {
        this.setState(state =>
            DateFilter.getStateFromSelectedOption(selectedFilterOption, state.excludeCurrentPeriod),
        );
    };
}

export const testAPI = {
    normalizeSelectedFilterOption,
};
