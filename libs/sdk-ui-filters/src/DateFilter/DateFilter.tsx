// (C) 2007-2026 GoodData Corporation

import {
    type ComponentType,
    type NamedExoticComponent,
    type ReactNode,
    memo,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { isEmpty, isEqual } from "lodash-es";

import {
    type DateFilterGranularity,
    type IActiveCalendars,
    type WeekStart,
    isAbsoluteDateFilterForm,
    isAllTimeDateFilterOption,
    isEmptyValuesDateFilterOption,
} from "@gooddata/sdk-model";
import { type OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { type IFilterButtonCustomIcon, type VisibilityMode } from "../shared/interfaces/index.js";

import { DEFAULT_DATE_FORMAT } from "./constants/Platform.js";
import { type IFilterConfigurationProps } from "./DateFilterBody/types.js";
import { type IDateFilterButtonProps } from "./DateFilterButton/DateFilterButton.js";
import { DateFilterCore } from "./DateFilterCore.js";
import {
    type DateFilterOption,
    type IDateFilterOptionsByType,
    isUiRelativeDateFilterForm,
} from "./interfaces/index.js";
import { normalizeSelectedFilterOption } from "./utils/FilterOptionNormalization.js";
import { canExcludeCurrentPeriod } from "./utils/PeriodExclusion.js";
import { validateFilterOption } from "./validation/OptionValidation.js";

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
    /**
     * If enabled, the absolute date filter form time inputs allow second-level precision (HH:mm:ss) instead
     * of minute precision (HH:mm). Only takes effect together with `isTimeForAbsoluteRangeEnabled`.
     *
     * @defaultValue false
     */
    isSecondsForAbsoluteRangeEnabled?: boolean;

    /**
     * Enables Day/Week/Month/Quarter/Year granularity switching for the absolute (static) date filter.
     *
     * @remarks
     * Defaults to `false` to keep backward compatibility. Dashboard apps should control this
     * via a feature flag and explicitly opt-in.
     *
     * @alpha
     */
    isAbsoluteDateFilterGranularityEnabled?: boolean;
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
     * Enables empty date values UI (e.g. “Other → Empty values” preset, empty-values handling controls).
     *
     * @remarks
     * Defaults to `false` to keep backward compatibility. Dashboard apps should control this
     * via a feature flag and explicitly opt-in.
     *
     * @alpha
     */
    enableEmptyDateValues?: boolean;

    /**
     * When true, the "Exclude current period" toggle is hidden when it is disabled
     * for the currently selected option.
     *
     * @remarks
     * By default (false), the toggle remains visible and is rendered disabled when not applicable.
     *
     * @defaultValue false
     * @alpha
     */
    hideDisabledExclude?: boolean;

    /**
     * Active calendars configuration from workspace settings.
     * Controls which calendar types (standard/fiscal) are available in the filter.
     *
     * @remarks
     * When provided:
     * - `standard: true` enables standard calendar presets
     * - `fiscal: true` enables fiscal calendar presets
     * - `default` determines which tab is selected by default ("STANDARD" or "FISCAL")
     *
     * When undefined, defaults to standard calendar only.
     *
     * @alpha
     */
    activeCalendars?: IActiveCalendars;

    /**
     * Custom content rendered at the end of the hint area of the static period (absolute range) form,
     * after the default date/time format hints.
     *
     * @remarks
     * Use this to surface an application-specific note about the selected range (e.g. that the whole
     * period is always applied). The content is appended after the built-in hints, so their
     * accessibility wiring (`aria-describedby` of the range inputs) is preserved.
     *
     * @alpha
     */
    customRangeHint?: ReactNode;
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

function getStateFromProps(props: IDateFilterProps): IDateFilterState {
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

function getStateFromWorkingProps(props: IDateFilterProps): IDateFilterState {
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
}

function getStateFromSelectedOption(
    selectedFilterOption: DateFilterOption,
    excludeCurrentPeriod: boolean,
): Pick<IDateFilterState, "selectedFilterOption" | "excludeCurrentPeriod" | "isExcludeCurrentPeriodEnabled"> {
    const canExcludeCurrent = canExcludeCurrentPeriod(selectedFilterOption);
    return {
        selectedFilterOption,
        excludeCurrentPeriod: canExcludeCurrent ? excludeCurrentPeriod : false,
        isExcludeCurrentPeriodEnabled: canExcludeCurrent,
    };
}

/**
 * Equivalent of the former `getDerivedStateFromProps`: re-syncs the state whenever the incoming
 * props no longer match the `init*` sentinels stored in the state. Returns `null` when the state
 * is already in sync.
 */
function getDerivedStateFromProps(
    nextProps: IDateFilterProps,
    prevState: IDateFilterState,
): IDateFilterState | null {
    if (
        nextProps.withoutApply &&
        nextProps.workingSelectedFilterOption &&
        nextProps.excludeCurrentPeriod !== undefined &&
        (!isEqual(nextProps.workingSelectedFilterOption, prevState.initWorkingSelectedFilterOption) ||
            nextProps.workingExcludeCurrentPeriod !== prevState.initWorkingExcludeCurrentPeriod)
    ) {
        return getStateFromWorkingProps(nextProps);
    }
    if (
        !isEqual(nextProps.selectedFilterOption, prevState.initSelectedFilterOption) ||
        nextProps.excludeCurrentPeriod !== prevState.initExcludeCurrentPeriod
    ) {
        return getStateFromProps(nextProps);
    }

    return null;
}

function checkInitialFilterOption(filterOption: DateFilterOption) {
    if (
        isAbsoluteDateFilterForm(filterOption) &&
        (filterOption.from === null ||
            filterOption.from === undefined ||
            filterOption.to === null ||
            filterOption.to === undefined)
    ) {
        console.warn(
            "The default filter option is not valid. Values 'from' and 'to' from absoluteForm filter option must be specified.",
        );
    }

    if (
        isUiRelativeDateFilterForm(filterOption) &&
        (filterOption.from === null ||
            filterOption.from === undefined ||
            filterOption.to === null ||
            filterOption.to === undefined)
    ) {
        console.warn(
            "The default filter option is not valid. Values 'from' and 'to' from relativeForm filter option must be specified.",
        );
    }
}

function isSameOptionExceptEmptyValueHandling(a: DateFilterOption, b: DateFilterOption): boolean {
    const { emptyValueHandling: _aEmptyValueHandling, ...aWithoutEmptyValueHandling } = a;
    const { emptyValueHandling: _bEmptyValueHandling, ...bWithoutEmptyValueHandling } = b;

    return isEqual(aWithoutEmptyValueHandling, bWithoutEmptyValueHandling);
}

/**
 * {@link https://www.gooddata.com/docs/gooddata-ui/latest/references/filters/date_filter | DateFilter} is a component for configuring a date filter value.
 *
 * @public
 */
export const DateFilter: NamedExoticComponent<IDateFilterProps> = memo(function DateFilter(
    props: IDateFilterProps,
) {
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
        isSecondsForAbsoluteRangeEnabled = false,
        isAbsoluteDateFilterGranularityEnabled = false,
        weekStart = "Sunday",
        customIcon,
        showDropDownHeaderMessage,
        FilterConfigurationComponent,
        withoutApply = false,
        ButtonComponent,
        overlayPositionType,
        activeCalendars,
        enableEmptyDateValues,
        customRangeHint,
        hideDisabledExclude = false,
        onApply,
        onSelect,
        onCancel = () => {},
        onOpen = () => {},
        onClose = () => {},
    } = props;

    const [storedState, setStoredState] = useState<IDateFilterState>(() => getStateFromProps(props));

    // The class component read `this.state` at call time, so a handler invoked later than the
    // render that produced it still saw the current state. Handlers of a function component
    // capture their render instead, and the range picker defers the Enter submit by a tick (see
    // `updateRangeState` in DateRangePicker) - the deferred `submitForm` therefore calls the
    // `onApplyClick` of the render that scheduled it, i.e. from before the typed date was stored.
    // Mirroring the state in a ref and updating it together with the state restores the original
    // semantics for such deferred calls.
    const stateRef = useRef(storedState);
    const setState = useCallback((updater: (prevState: IDateFilterState) => IDateFilterState) => {
        stateRef.current = updater(stateRef.current);
        setStoredState(stateRef.current);
    }, []);

    // The class fired `onSelect` from a `setState` callback, i.e. only after the new state was
    // committed and re-synced from the (possibly already updated) props. Firing it straight from
    // the handler would emit the pre-commit option - most visibly on Apply, where the body runs
    // `onApplyClick(); closeDropdown();` in a single batch, so the discard triggered by closing
    // would report the option that Apply has just replaced. Handlers therefore only mark a
    // pending emission here and the effect below fires it once the state has settled.
    // `selectedFilterOption` is set when the handler already knows the option to report.
    const pendingSelectRef = useRef<{ selectedFilterOption?: DateFilterOption } | null>(null);

    // Replacement of the former `getDerivedStateFromProps`: the state is adjusted during render
    // (see https://react.dev/reference/react/useState#storing-information-from-previous-renders)
    // so that the re-synced option is rendered right away instead of flashing the stale one.
    // The `isEqual` guard makes the extra render pass a no-op once the state is in sync.
    let state = storedState;
    const derivedState = getDerivedStateFromProps(props, storedState);
    if (derivedState !== null && !isEqual(derivedState, storedState)) {
        setState(() => derivedState);
        state = derivedState;
    }

    useEffect(() => {
        checkInitialFilterOption(originalSelectedFilterOption);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const normalizeEmptyValueHandling = (selectedFilterOption: DateFilterOption): DateFilterOption => {
        if (!enableEmptyDateValues) {
            return selectedFilterOption;
        }

        if (isEmptyValuesDateFilterOption(selectedFilterOption)) {
            return {
                ...selectedFilterOption,
                emptyValueHandling: "only",
            };
        }

        if (selectedFilterOption.emptyValueHandling === "only") {
            return {
                ...selectedFilterOption,
                emptyValueHandling: "exclude",
            };
        }

        return selectedFilterOption;
    };

    const mergeEmptyValueHandling = (
        nextSelectedFilterOption: DateFilterOption,
        currentSelectedFilterOption: DateFilterOption,
    ): DateFilterOption => {
        if (!enableEmptyDateValues) {
            return nextSelectedFilterOption;
        }

        if (isEmptyValuesDateFilterOption(nextSelectedFilterOption)) {
            return nextSelectedFilterOption;
        }

        // Keep the "All time exclude empty values" checkbox state separate from the
        // "Include empty values" checkbox used for non-all-time options.
        // Also, never carry state to/from the dedicated "Empty values" preset.
        const isCurrentAllTime = isAllTimeDateFilterOption(currentSelectedFilterOption);
        const isNextAllTime = isAllTimeDateFilterOption(nextSelectedFilterOption);
        if (isCurrentAllTime !== isNextAllTime) {
            return nextSelectedFilterOption;
        }

        const currentHandling = currentSelectedFilterOption.emptyValueHandling;
        if (
            nextSelectedFilterOption.emptyValueHandling === undefined &&
            currentHandling !== undefined &&
            currentHandling !== "only"
        ) {
            // If the only difference is `emptyValueHandling` (e.g. user unchecks the checkbox),
            // do not carry the previous value back in.
            if (isSameOptionExceptEmptyValueHandling(nextSelectedFilterOption, currentSelectedFilterOption)) {
                return nextSelectedFilterOption;
            }

            return {
                ...nextSelectedFilterOption,
                emptyValueHandling: currentHandling,
            };
        }

        return nextSelectedFilterOption;
    };

    const fireOnSelect = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        const normalizedSelectedFilterOption = normalizeEmptyValueHandling(
            normalizeSelectedFilterOption(selectedFilterOption),
        );
        if (isEmpty(validateFilterOption(normalizedSelectedFilterOption))) {
            onSelect?.(normalizedSelectedFilterOption, excludeCurrentPeriod);
        }
    };

    // Runs after every commit, i.e. after the derived-state block above has re-synced `state` with
    // the incoming props - the equivalent of the former `setState(updater, callback)` timing.
    useEffect(() => {
        const pendingSelect = pendingSelectRef.current;
        if (!pendingSelect) {
            return;
        }
        pendingSelectRef.current = null;
        fireOnSelect(
            pendingSelect.selectedFilterOption ?? state.selectedFilterOption,
            state.excludeCurrentPeriod,
        );
    });

    const handleApplyClick = () => {
        // `stateRef`, not `state`: this can run from the range picker's deferred submit.
        const { selectedFilterOption: optionToApply, excludeCurrentPeriod: excludeToApply } =
            stateRef.current;
        const normalizedSelectedFilterOption = normalizeEmptyValueHandling(
            normalizeSelectedFilterOption(optionToApply),
        );
        onApply(normalizedSelectedFilterOption, excludeToApply);
    };

    const onChangesDiscarded = () => {
        if (!withoutApply) {
            setState(() => getStateFromProps(props));
            pendingSelectRef.current = {};
        } else if (withoutApply && !isEmpty(validateFilterOption(stateRef.current.selectedFilterOption))) {
            setState(() => getStateFromWorkingProps(props));
        }
    };

    const onCancelClicked = () => {
        onCancel();
        onChangesDiscarded();
    };

    const onDropdownOpenChanged = (isOpen: boolean) => {
        if (isOpen) {
            onOpen();
        } else {
            onClose();
            onChangesDiscarded();
        }
    };

    const handleExcludeCurrentPeriodChange = (excludeCurrentPeriod: boolean) => {
        setState((prevState) => ({ ...prevState, excludeCurrentPeriod }));
        pendingSelectRef.current = {};
    };

    const handleSelectedFilterOptionChange = (selectedFilterOption: DateFilterOption) => {
        setState((prevState) => {
            // Merging against `prevState` rather than the render snapshot mirrors the former
            // updater: two option changes batched into one event must both be taken into account.
            const nextSelectedFilterOption = normalizeEmptyValueHandling(
                mergeEmptyValueHandling(selectedFilterOption, prevState.selectedFilterOption),
            );
            // Recorded here - as the former updater did with its closure variable - so that the
            // effect above reports the option this change actually resolved to.
            pendingSelectRef.current = { selectedFilterOption: nextSelectedFilterOption };

            return {
                ...prevState,
                ...getStateFromSelectedOption(nextSelectedFilterOption, prevState.excludeCurrentPeriod),
            };
        });
    };

    const { excludeCurrentPeriod, selectedFilterOption, isExcludeCurrentPeriodEnabled } = state;

    return dateFilterMode === "hidden" ? null : (
        <DateFilterCore
            availableGranularities={availableGranularities}
            customFilterName={customFilterName}
            dateFormat={dateFormat ?? DEFAULT_DATE_FORMAT}
            openOnInit={openOnInit}
            showDropDownHeaderMessage={showDropDownHeaderMessage}
            disabled={dateFilterMode === "readonly"}
            excludeCurrentPeriod={excludeCurrentPeriod}
            originalExcludeCurrentPeriod={originalExcludeCurrentPeriod}
            isExcludeCurrentPeriodEnabled={isExcludeCurrentPeriodEnabled}
            hideDisabledExclude={hideDisabledExclude}
            isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled ?? false}
            isSecondsForAbsoluteRangeEnabled={isSecondsForAbsoluteRangeEnabled ?? false}
            isAbsoluteDateFilterGranularityEnabled={isAbsoluteDateFilterGranularityEnabled ?? false}
            isEditMode={isEditMode ?? false}
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
            activeCalendars={activeCalendars}
            enableEmptyDateValues={enableEmptyDateValues}
            customRangeHint={customRangeHint}
        />
    );
});
