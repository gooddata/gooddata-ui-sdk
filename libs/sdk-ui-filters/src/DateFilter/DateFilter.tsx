// (C) 2007-2019 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import {
    isRelativeDateFilterForm,
    DateFilterGranularity,
    DashboardDateFilterConfigMode,
} from "@gooddata/sdk-backend-spi";
import { canExcludeCurrentPeriod } from "./utils/PeriodExlusion";

import { DateFilterCore } from "./DateFilterCore";
import { validateFilterOption } from "./validation/OptionValidation";
import { DateFilterOption, IDateFilterOptionsByType } from "./interfaces";

export const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";

const normalizeSelectedFilterOption = (selectedFilterOption: DateFilterOption): DateFilterOption => {
    if (
        isRelativeDateFilterForm(selectedFilterOption) &&
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

/**
 * @beta
 */
export interface IDateFilterStatePropsIntersection {
    excludeCurrentPeriod: boolean;
    selectedFilterOption: DateFilterOption;
}

/**
 * @beta
 */
export interface IDateFilterOwnProps extends IDateFilterStatePropsIntersection {
    filterOptions: IDateFilterOptionsByType;
    availableGranularities: DateFilterGranularity[];
    isEditMode?: boolean;
    customFilterName?: string;
    dateFilterMode: DashboardDateFilterConfigMode;
    dateFormat?: string;
    locale?: string;
}

/**
 * @beta
 */
export interface IDateFilterCallbackProps {
    onApply: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
    onCancel?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
}

/**
 * @beta
 */
export interface IDateFilterProps extends IDateFilterOwnProps, IDateFilterCallbackProps {}

/**
 * @beta
 */
export interface IDateFilterState extends IDateFilterStatePropsIntersection {
    initExcludeCurrentPeriod: boolean;
    initSelectedFilterOption: DateFilterOption;
    isExcludeCurrentPeriodEnabled: boolean;
}

/**
 * @beta
 */
export class DateFilter extends React.PureComponent<IDateFilterProps, IDateFilterState> {
    public static defaultProps: Partial<IDateFilterProps> = {
        dateFormat: DEFAULT_DATE_FORMAT,
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

    constructor(props: IDateFilterProps) {
        super(props);
        this.state = DateFilter.getStateFromProps(props);

        // eslint-disable-next-line no-console
        console.warn(
            "DateFilter component is still in beta. Component and its API may change in the future.",
        );
    }

    public render(): React.ReactNode {
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

    private handleSelectedFilterOptionChange = (selectedFilterOption: DateFilterOption) => {
        this.setState((state) =>
            DateFilter.getStateFromSelectedOption(selectedFilterOption, state.excludeCurrentPeriod),
        );
    };
}

export const testAPI = {
    normalizeSelectedFilterOption,
};
