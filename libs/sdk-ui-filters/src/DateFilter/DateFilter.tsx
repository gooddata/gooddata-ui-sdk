// (C) 2007-2025 GoodData Corporation
import { ComponentType, memo, useCallback, useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import noop from "lodash/noop.js";
import { DateFilterGranularity, isAbsoluteDateFilterForm, WeekStart } from "@gooddata/sdk-model";
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
import { IFilterButtonCustomIcon, VisibilityMode } from "../shared/index.js";
import { IFilterConfigurationProps } from "./DateFilterBody/types.js";
import isEmpty from "lodash/isEmpty.js";
import { IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import { OverlayPositionType } from "@gooddata/sdk-ui-kit";

/**
 * Props of the {@link DateFilter} component that are reflected in the state.
 *
 * @public
 */
export interface IDateFilterStatePropsIntersection {
    excludeCurrentPeriod: boolean;
    selectedFilterOption?: DateFilterOption;
}

/**
 * Props of the {@link DateFilter} component.
 * @public
 */
export interface IDateFilterOwnProps extends IDateFilterStatePropsIntersection {
    filterOptions: IDateFilterOptionsByType;
    availableGranularities?: DateFilterGranularity[];
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
    FilterConfigurationComponent?: ComponentType<IFilterConfigurationProps>;

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
}

/**
 * Callback props of the {@link DateFilter} component.
 *
 * @public
 */
export interface IDateFilterCallbackProps {
    onApply?: (dateFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => void;
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

const getStateFromProps = (props: IDateFilterProps): IDateFilterState => {
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
};

const getStateFromWorkingProps = (props: IDateFilterProps): IDateFilterState => {
    const selectedFilterOption = props.workingSelectedFilterOption ?? props.selectedFilterOption;
    const canExcludeCurrent = canExcludeCurrentPeriod(selectedFilterOption);
    return {
        ...getStateFromProps(props),
        selectedFilterOption: selectedFilterOption,
        excludeCurrentPeriod: canExcludeCurrent
            ? (props.workingExcludeCurrentPeriod ?? props.excludeCurrentPeriod)
            : false,
        initWorkingExcludeCurrentPeriod: props.workingExcludeCurrentPeriod ?? props.excludeCurrentPeriod,
        initWorkingSelectedFilterOption: selectedFilterOption,
        initExcludeCurrentPeriod: props.excludeCurrentPeriod,
        isExcludeCurrentPeriodEnabled: canExcludeCurrent,
    };
};

const getStateFromSelectedOption = (
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

const checkInitialFilterOption = (filterOption: DateFilterOption) => {
    if (isAbsoluteDateFilterForm(filterOption) && (isNil(filterOption.from) || isNil(filterOption.to))) {
        console.warn(
            "The default filter option is not valid. Values 'from' and 'to' from absoluteForm filter option must be specified.",
        );
    }

    if (isUiRelativeDateFilterForm(filterOption) && (isNil(filterOption.from) || isNil(filterOption.to))) {
        console.warn(
            "The default filter option is not valid. Values 'from' and 'to' from relativeForm filter option must be specified.",
        );
    }
};

/**
 * {@link https://sdk.gooddata.com/gooddata-ui/docs/date_filter_component.html | DateFilter} is a component for configuring a date filter value.
 *
 * @public
 */
export const DateFilter = memo(function DateFilter(props: IDateFilterProps) {
    const {
        customFilterName,
        dateFilterMode,
        dateFormat = DEFAULT_DATE_FORMAT,
        filterOptions,
        selectedFilterOption: originalSelectedFilterOption,
        excludeCurrentPeriod: originalExcludeCurrentPeriod,
        availableGranularities,
        isEditMode = false,
        openOnInit,
        locale = "en-US",
        isTimeForAbsoluteRangeEnabled = false,
        weekStart = "Sunday" as const,
        customIcon,
        showDropDownHeaderMessage,
        FilterConfigurationComponent,
        withoutApply: withoutApplyProp = false,
        enableDashboardFiltersApplyModes,
        ButtonComponent,
        overlayPositionType,
        onApply,
        onSelect,
        onCancel = noop,
        onOpen = noop,
        onClose = noop,
        workingSelectedFilterOption,
        workingExcludeCurrentPeriod,
    } = props;

    const withoutApply = withoutApplyProp ?? enableDashboardFiltersApplyModes;

    // Initialize state based on props
    const [state, setState] = useState<IDateFilterState>(() => getStateFromProps(props));

    // Track previous props for getDerivedStateFromProps equivalent
    const prevPropsRef = useRef<{
        selectedFilterOption: DateFilterOption;
        excludeCurrentPeriod: boolean;
        workingSelectedFilterOption?: DateFilterOption;
        workingExcludeCurrentPeriod?: boolean;
    }>({
        selectedFilterOption: originalSelectedFilterOption,
        excludeCurrentPeriod: originalExcludeCurrentPeriod,
        workingSelectedFilterOption,
        workingExcludeCurrentPeriod,
    });

    // getDerivedStateFromProps equivalent
    useEffect(() => {
        const prevProps = prevPropsRef.current;
        const withoutApplyFlag = withoutApplyProp ?? enableDashboardFiltersApplyModes;

        if (
            withoutApplyFlag &&
            workingSelectedFilterOption &&
            originalExcludeCurrentPeriod !== undefined &&
            (!isEqual(workingSelectedFilterOption, prevProps.workingSelectedFilterOption) ||
                originalExcludeCurrentPeriod !== prevProps.workingExcludeCurrentPeriod)
        ) {
            setState(getStateFromWorkingProps(props));
        } else if (
            !isEqual(originalSelectedFilterOption, prevProps.selectedFilterOption) ||
            originalExcludeCurrentPeriod !== prevProps.excludeCurrentPeriod
        ) {
            setState(getStateFromProps(props));
        }

        // Update prev props
        prevPropsRef.current = {
            selectedFilterOption: originalSelectedFilterOption,
            excludeCurrentPeriod: originalExcludeCurrentPeriod,
            workingSelectedFilterOption,
            workingExcludeCurrentPeriod,
        };
    }, [
        originalSelectedFilterOption,
        originalExcludeCurrentPeriod,
        workingSelectedFilterOption,
        workingExcludeCurrentPeriod,
        withoutApplyProp,
        enableDashboardFiltersApplyModes,
        props,
    ]);

    // componentDidMount equivalent
    useEffect(() => {
        checkInitialFilterOption(originalSelectedFilterOption);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectChange = useCallback(() => {
        const normalizedSelectedFilterOption = normalizeSelectedFilterOption(state.selectedFilterOption);
        if (isEmpty(validateFilterOption(normalizedSelectedFilterOption))) {
            onSelect?.(normalizedSelectedFilterOption, state.excludeCurrentPeriod);
        }
    }, [state.selectedFilterOption, state.excludeCurrentPeriod, onSelect]);

    const handleApplyClick = useCallback(() => {
        const normalizedSelectedFilterOption = normalizeSelectedFilterOption(state.selectedFilterOption);
        onApply(normalizedSelectedFilterOption, state.excludeCurrentPeriod);
    }, [state.selectedFilterOption, state.excludeCurrentPeriod, onApply]);

    const onChangesDiscarded = useCallback(() => {
        if (!withoutApply) {
            setState(getStateFromProps(props));
            setTimeout(handleSelectChange, 0); // Schedule after state update
        } else if (withoutApply && !isEmpty(validateFilterOption(state.selectedFilterOption))) {
            setState(getStateFromWorkingProps(props));
        }
    }, [withoutApply, props, handleSelectChange, state.selectedFilterOption]);

    const onCancelClicked = useCallback(() => {
        onCancel();
        onChangesDiscarded();
    }, [onCancel, onChangesDiscarded]);

    const onDropdownOpenChanged = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                onOpen();
            } else {
                onClose();
                onChangesDiscarded();
            }
        },
        [onOpen, onClose, onChangesDiscarded],
    );

    const handleExcludeCurrentPeriodChange = useCallback(
        (excludeCurrentPeriod: boolean) => {
            setState((prevState) => ({ ...prevState, excludeCurrentPeriod }));
            setTimeout(handleSelectChange, 0); // Schedule after state update
        },
        [handleSelectChange],
    );

    const handleSelectedFilterOptionChange = useCallback(
        (selectedFilterOption: DateFilterOption) => {
            setState((prevState) => ({
                ...prevState,
                ...getStateFromSelectedOption(selectedFilterOption, prevState.excludeCurrentPeriod),
            }));
            setTimeout(handleSelectChange, 0); // Schedule after state update
        },
        [handleSelectChange],
    );

    const { excludeCurrentPeriod, selectedFilterOption, isExcludeCurrentPeriodEnabled } = state;

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
            onApplyClick={handleApplyClick}
            onCancelClick={onCancelClicked}
            onDropdownOpenChanged={onDropdownOpenChanged}
            onExcludeCurrentPeriodChange={handleExcludeCurrentPeriodChange}
            onSelectedFilterOptionChange={handleSelectedFilterOptionChange}
            errors={validateFilterOption(selectedFilterOption)}
            weekStart={weekStart}
            customIcon={customIcon}
            FilterConfigurationComponent={FilterConfigurationComponent}
            withoutApply={withoutApply}
            ButtonComponent={ButtonComponent}
            overlayPositionType={overlayPositionType}
        />
    );
});
