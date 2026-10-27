// (C) 2007-2026 GoodData Corporation

import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { isEmpty, isEqual } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { type Subscription } from "rxjs";

import {
    type DateFilterGranularity,
    type IActiveCalendars,
    type ILowerBoundedFilter,
    type IUpperBoundedFilter,
    type WeekStart,
    areObjRefsEqual,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";
import {
    type CalendarTabType,
    type DateFilterRelativeOptionGroup,
    type IFiscalTabsConfig,
    STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT,
    isFiscalGranularity,
} from "@gooddata/sdk-ui-filters";
import { CalendarTypeTabs } from "@gooddata/sdk-ui-filters/internal";
import { Bubble, BubbleHoverTrigger, Button, NoData, Overlay, ShortenedText } from "@gooddata/sdk-ui-kit";

import {
    MeasureDateDatasetsActions,
    type measureDateDatasetsRequested,
} from "../../actions/measure_date_datasets_actions.js";
import { ALL_TIME, OTHER, STATIC_PERIOD } from "../../constants/presets.js";
import { DecoratedDateFilter, type IDecoratedDateFilter } from "../../models/date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { type IDecoratedDateDataset } from "../../models/decorated_date_dataset.js";
import { GRANULARITY } from "../../models/granularity.js";
import {
    DecoratedPresetItem,
    type IDecoratedPresetItem,
    type IPresetItem,
    MEASURE_DATE_FILTER_PRESETS,
    PRESETS_BY_NAME,
    createDecoratedPresetItem,
} from "../../models/preset_item.js";
import { loadDateDatasetsToDateDropdown } from "../../sagas/date_datasets/date_datasets_actions.js";
import {
    areGenericDateAttributeElementsSupported,
    supportsTimeGranularities,
} from "../../selectors/backend_capabilities_selector.js";
import { enableImprovedMetricDateFilter, getWeekStart } from "../../selectors/feature_flag_selector.js";
import { measureDateFilterSelector } from "../../selectors/measure_date_filter_selector.js";
import { type IMetricDateFilterApplyPayload } from "../../store/bucket_filters/bucket_filters_actions.js";
import { metricFilterToAttributeFilter } from "../../store/bucket_filters/metric_additional_date_filters.js";
import { getDateAttributes } from "../../store/date_datasets_meta/date_datasets_meta_selectors.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
} from "../../store/filter_bar/filter_bar_types.js";
import { type IAppState } from "../../store/types.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type IDateDatasetRefWithGranularities } from "../../typings/datasets.js";
import { DROPDOWN_ALIGNMENTS, getDialogHeight, subscribeEvents } from "../../utils/dropdown.js";
import { getIsoDate } from "../../utils/timers.js";
import { DateFilterPresets } from "../DateFilterPresets.js";
import { type IDateFilterOption } from "../filterBar/dateFilter/dateFilterOptionFactory.js";
import { ALL_TIME_FILTER_OPTION } from "../filterBar/dateFilter/defaultFilterOptions.js";
import { FilterDropdownOverlay } from "../filterBar/dateFilter/FilterDropdown/FilterDropdownOverlay.js";
import {
    selectIsSecondsGranularityEnabled,
    selectRelativeDateFilterPresets,
} from "../filterBar/dateFilter/selectors.js";
import { LoadingDropdown } from "../shared/LoadingDropdown.js";

import { DateDatasetsDropdown } from "./categories/DateDatasetsDropdown.js";
import {
    type IDateAttributeGranularitySource,
    buildMeasureAdditionalDateFilterLabels,
} from "./measureAdditionalDateFilterLabels.js";
import { measureDateFilterToOption, optionToMeasureDateFilterInterval } from "./measureDateFilterOption.js";
import { MeasureDateFilterPicker } from "./MeasureDateFilterPicker.js";
import { MeasureDateFilterTitle } from "./MeasureDateFilterTitle.js";
import { MeasureDateRangePicker } from "./MeasureDateRangePicker.js";

// Stands in for the date dataset while the first load has not resolved one yet; it only lays out the
// picker hidden under the loading layer, so it never needs to match a real dataset.
const LOADING_PLACEHOLDER_DATE_DATASET: IDecoratedDateDataset = {
    identifier: "",
    title: "",
    ref: { identifier: "", type: "dataSet" },
    isAvailable: true,
};

const NO_DATE_ATTRIBUTES: ReadonlyArray<IDateAttributeGranularitySource> = [];
const NO_ADDITIONAL_DATE_FILTERS: IBucketItemMetricFilter[] = [];

const DROPDOWN_HEADER_HEIGHT = 43;
const DROPDOWN_ITEM_HEIGHT = 23;

// A filter/preset value is "unset" while it is still the {} default; once selected it carries
// the decorated model fields (original, interval, ...).
const isEmptyFilter = (value: unknown): boolean => isEmpty(value);

enum ContentId {
    PRESETS_CONTENT_ID = "presets",
    DATE_RANGE_CONTENT_ID = "date-range",
}

export interface IMeasureDateFilterStateProps {
    projectTimezoneOffset: number;
    dateDatasetsList: ReadonlyArray<IDecoratedDateDataset>;
    dateDatasetsIsLoading: boolean;
    dateDatasetsUnavailableCount: number;
    dateFormat: string;
    selectedDateDataset: IDecoratedDateDataset;
    isDisabled: boolean;
    isDateDatasetsDropdownLoaded: boolean;
    formatLocale?: string;
    enableUnavailableItemsVisibility: boolean;
    activeCalendars?: IActiveCalendars;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    isImprovedMetricDateFilterEnabled?: boolean;
    relativeDateFilterPresets?: DateFilterRelativeOptionGroup;
    isTimeForAbsoluteRangeEnabled?: boolean;
    isSecondsGranularityEnabled?: boolean;
    weekStart?: WeekStart;
    areAdditionalDateFiltersSupported?: boolean;
    /** the date datasets' attributes, which give the additional date filters their granularity */
    dateAttributes?: ReadonlyArray<IDateAttributeGranularitySource>;
}

export interface IMeasureDateFilterOwnProps {
    filter?: IDecoratedDateFilter;
    bucketLocalIdentifier: string;
    bucketItem: IDecoratedBucketItem;
    onAdd: (dateFilter: IDecoratedDateFilter, selectedDateDatasetIdentifier: string) => void;
    onUpdate: (filter: IDecoratedDateFilter, dateFilter: IDecoratedDateFilter) => void;
    onRemove: (dateOriginal: IBucketItemMetricFilter, removeAdditionalDateFilters?: boolean) => void;
    selectDateDataset?: (measureIdentifier: string, selectedDateDatasetUri: string) => void;
    selectDateDatasetWithoutTimeTravel?: (
        measureIdentifier: string,
        selectedDateDatasetIdentifier: string,
    ) => void;
    requestMeasureDateDatasets?: (measureUri: string) => ReturnType<typeof measureDateDatasetsRequested>;
    callLoadDateDatasetsToDateDropdown?: (ignoreDateDataset: boolean) => void;
    /**
     * The metric's stored attribute filters on its date dataset's own attributes; edited inside the
     * date filter picker and applied as one set.
     */
    additionalDateFilters?: IBucketItemMetricFilter[];
    /**
     * Applies the shared picker as one gesture: the period, the date dataset and the additional
     * date filters.
     */
    onApply?: (payload: IMetricDateFilterApplyPayload) => void;
    /**
     * Whether this is the metric's primary (first) date filter — the one the measure-level date
     * dataset selection follows and the only one that owns additional date filters. With several
     * date filters per metric, the others name their own dataset (`ownDateDatasetIdentifier`).
     */
    isPrimaryDateFilter?: boolean;
    ownDateDatasetIdentifier?: string;
    /**
     * Opens the picker as soon as the chip mounts: the "Add filter" menu's Date entry mounts an
     * empty chip this way, which then adds the All time filter and shows its picker.
     */
    autoOpen?: boolean;
    /** Called when the picker closes. */
    onDropdownClosed?: () => void;
}

export type IMeasureDateFilterProps = IMeasureDateFilterStateProps & IMeasureDateFilterOwnProps;

interface IState {
    preset: IDecoratedPresetItem;
    dropdownHeight: number;
    displayDropdown: boolean;
    activeContentId: ContentId;
    selectedDateDataset?: IDecoratedDateDataset;
    start?: Date;
    end?: Date;
    selectedTab: CalendarTabType;
}

const initialState: IState = {
    preset: {},
    dropdownHeight: 300,
    displayDropdown: false,
    activeContentId: ContentId.PRESETS_CONTENT_ID,
    selectedTab: "standard",
};

const tooltipAlignPoints = [{ align: "bc tc" }];

const actions = {
    requestMeasureDateDatasets: MeasureDateDatasetsActions.measureDateDatasetsRequested,
    selectDateDataset: MeasureDateDatasetsActions.selectDateDataset,
    selectDateDatasetWithoutTimeTravel: MeasureDateDatasetsActions.selectDateDatasetWithoutTimeTravel,
    callLoadDateDatasetsToDateDropdown: loadDateDatasetsToDateDropdown,
};

export function MeasureDateFilterBase({
    filter = {} as IDecoratedDateFilter,
    projectTimezoneOffset,
    dateDatasetsList,
    dateDatasetsIsLoading,
    dateDatasetsUnavailableCount,
    dateFormat,
    selectedDateDataset: propsSelectedDateDataset,
    isDisabled: propsIsDisabled,
    isDateDatasetsDropdownLoaded,
    formatLocale,
    enableUnavailableItemsVisibility,
    bucketLocalIdentifier,
    bucketItem,
    onAdd,
    onUpdate,
    onRemove,
    selectDateDataset,
    selectDateDatasetWithoutTimeTravel,
    requestMeasureDateDatasets,
    callLoadDateDatasetsToDateDropdown,
    activeCalendars,
    dateDatasetRefsWithGranularities,
    isImprovedMetricDateFilterEnabled = false,
    relativeDateFilterPresets,
    isTimeForAbsoluteRangeEnabled = false,
    isSecondsGranularityEnabled = false,
    weekStart,
    areAdditionalDateFiltersSupported: areAdditionalDateFiltersSupportedProp = false,
    isPrimaryDateFilter = true,
    dateAttributes = NO_DATE_ATTRIBUTES,
    additionalDateFilters = NO_ADDITIONAL_DATE_FILTERS,
    onApply,
    autoOpen = false,
    onDropdownClosed,
}: IMeasureDateFilterProps): ReactElement {
    const intl = useIntl();

    const [state, setState] = useState<IState>(initialState);
    const subscribersRef = useRef<Subscription[]>([]);
    const buttonRef = useRef<HTMLElement | null>(null);

    const isDisabled = useCallback(() => {
        return propsIsDisabled;
    }, [propsIsDisabled]);

    const getPeriodDate = useCallback(
        (interval: IDecoratedPresetItem, name: "start" | "end") => {
            const pickerInterval = DecoratedPresetItem.getPickerInterval(interval, projectTimezoneOffset);
            return pickerInterval ? pickerInterval[name] : null;
        },
        [projectTimezoneOffset],
    );

    const getPeriodStart = useCallback(
        (interval: IDecoratedPresetItem) => {
            return getPeriodDate(interval, "start");
        },
        [getPeriodDate],
    );

    const getPeriodEnd = useCallback(
        (interval: IDecoratedPresetItem) => {
            return getPeriodDate(interval, "end");
        },
        [getPeriodDate],
    );

    const getOriginalDateFilter = useCallback((dateFilter: IDecoratedDateFilter): IPresetItem | null => {
        if (!dateFilter || isEmptyFilter(dateFilter)) {
            return null;
        }

        return dateFilter.interval?.original;
    }, []);

    const getDecoratedDateFilter = useCallback((dateFilter: IPresetItem): IDecoratedPresetItem | null => {
        if (!dateFilter || isEmptyFilter(dateFilter)) {
            return null;
        }

        const presetDateFilter = MEASURE_DATE_FILTER_PRESETS.find((preset) => {
            if (!preset) {
                return false;
            }

            const sameGranularity = preset.granularity === dateFilter.granularity;

            // Safely compare intervals with null checks
            const presetInterval = preset.interval;
            const filterInterval = dateFilter.interval;
            const sameInterval =
                presetInterval && filterInterval
                    ? isEqual(presetInterval, filterInterval)
                    : presetInterval === filterInterval;

            // Compare boundedFilter to distinguish between regular filters and "to date" filters;
            // the union is probed leniently for both bounds' fields
            const presetBoundedFilter = preset.boundedFilter as
                | Partial<IUpperBoundedFilter & ILowerBoundedFilter>
                | undefined;
            const filterBoundedFilter = dateFilter.boundedFilter as
                | Partial<IUpperBoundedFilter & ILowerBoundedFilter>
                | undefined;
            const sameBoundedFilter = (() => {
                // Both filters have no boundedFilter - they match
                if (presetBoundedFilter === undefined && filterBoundedFilter === undefined) {
                    return true;
                }

                // Both have boundedFilter - compare their properties
                if (presetBoundedFilter && filterBoundedFilter) {
                    return (
                        presetBoundedFilter.to === filterBoundedFilter.to &&
                        presetBoundedFilter.granularity === filterBoundedFilter.granularity
                    );
                }

                // One has boundedFilter and the other doesn't - they don't match
                return false;
            })();

            return sameGranularity && sameInterval && sameBoundedFilter;
        });

        if (presetDateFilter) {
            return presetDateFilter;
        }

        return createDecoratedPresetItem(dateFilter);
    }, []);

    const updateDateFilter = useCallback(
        (dateFilter?: IPresetItem): void => {
            let decoratedDateFilter = getDecoratedDateFilter(dateFilter);
            let selectedDecoratedDateFilter: IDecoratedPresetItem = {};
            let activeContentId = ContentId.PRESETS_CONTENT_ID;

            if (decoratedDateFilter) {
                const isPresetInterval = !decoratedDateFilter.isStatic;
                activeContentId = isPresetInterval
                    ? ContentId.PRESETS_CONTENT_ID
                    : ContentId.DATE_RANGE_CONTENT_ID;
                selectedDecoratedDateFilter = decoratedDateFilter;
            } else {
                decoratedDateFilter = PRESETS_BY_NAME["last_30_days"];
            }

            const start = getPeriodStart(decoratedDateFilter);
            const end = getPeriodEnd(decoratedDateFilter);

            setState((prevState) => ({
                ...prevState,
                activeContentId,
                preset: selectedDecoratedDateFilter,
                start,
                end,
            }));
        },
        [getDecoratedDateFilter, getPeriodStart, getPeriodEnd],
    );

    const restoreView = useCallback((): void => {
        const originalDateFilter = getOriginalDateFilter(filter);
        updateDateFilter(originalDateFilter);
    }, [filter, getOriginalDateFilter, updateDateFilter]);

    const setDropdownHeight = useCallback((): void => {
        if (!buttonRef.current) {
            return;
        }

        const dialogHeight = getDialogHeight(buttonRef.current.getBoundingClientRect().top, window, true);
        const dropdownHeight = dialogHeight - DROPDOWN_HEADER_HEIGHT;
        setState((prevState) => ({ ...prevState, dropdownHeight }));
    }, []);

    const setSelectedDateDataset = useCallback((dateDataset: IDecoratedDateDataset): void => {
        setState((prevState) => ({ ...prevState, selectedDateDataset: dateDataset }));
    }, []);

    const isPresetSet = useCallback((): boolean => {
        return !isEmptyFilter(state.preset);
    }, [state.preset]);

    // With the shared picker the chip follows its `filter` prop: chips are keyed by position, so
    // the same instance may show one filter after another (or none, then one).
    const hasDateFilter = useCallback(
        (): boolean =>
            isImprovedMetricDateFilterEnabled
                ? !!getOriginalDateFilter(filter)
                : !isEmptyFilter(filter) && isPresetSet(),
        [isImprovedMetricDateFilterEnabled, filter, getOriginalDateFilter, isPresetSet],
    );

    const closeDropdown = useCallback((): void => {
        setState((prevState) => ({ ...prevState, displayDropdown: false }));
    }, []);

    const setSelectedPreset = useCallback(
        (preset: IDecoratedPresetItem) => {
            const originalInterval = preset.original;

            const dateFilter = {
                identifier: DATE_DATASET_ATTRIBUTE,
                interval: originalInterval,
            } as unknown as IDecoratedDateFilter;

            if (isPresetSet()) {
                // the measure-level selection belongs to the primary date filter; a further one (an
                // insight saved with several, shown here with the flag off) keeps its hands off it
                if (isPrimaryDateFilter) {
                    selectDateDatasetWithoutTimeTravel(
                        bucketItem.localIdentifier,
                        state.selectedDateDataset.identifier,
                    );
                }
                onUpdate(filter, dateFilter);
            } else {
                onAdd(dateFilter, state.selectedDateDataset.identifier);
            }

            updateDateFilter(originalInterval);

            closeDropdown();
        },
        [
            isPresetSet,
            isPrimaryDateFilter,
            bucketItem,
            selectDateDatasetWithoutTimeTravel,
            state.selectedDateDataset,
            onUpdate,
            filter,
            onAdd,
            updateDateFilter,
            closeDropdown,
        ],
    );

    const onDateDatasetChange = useCallback(
        (selectedDateDataset: IDecoratedDateDataset) => {
            const dateDataset = dateDatasetsList.find(
                (dateDataset) => dateDataset.identifier === selectedDateDataset.identifier,
            );

            setSelectedDateDataset(dateDataset);

            // The shared picker commits the dataset together with the period on Apply.
            if (isPresetSet() && !isImprovedMetricDateFilterEnabled) {
                const measureLocalIdentifier: string = bucketItem.localIdentifier;
                selectDateDataset(measureLocalIdentifier, dateDataset.identifier);
            }
        },
        [
            dateDatasetsList,
            setSelectedDateDataset,
            isPresetSet,
            isImprovedMetricDateFilterEnabled,
            bucketItem,
            selectDateDataset,
        ],
    );

    const onSelectPreset = useCallback(
        (preset: IDecoratedPresetItem) => {
            const name = preset.name;
            if (name === STATIC_PERIOD) {
                setState((prevState) => ({
                    ...prevState,
                    activeContentId: ContentId.DATE_RANGE_CONTENT_ID,
                }));
            } else {
                setSelectedPreset(preset);
            }
        },
        [setSelectedPreset],
    );

    const applyDateRangeChange = useCallback(
        (start: Date, end: Date): void => {
            const preset = createDecoratedPresetItem({
                interval: [getIsoDate(start), getIsoDate(end)],
                type: "absolute",
                granularity: GRANULARITY.DATE,
            });

            setSelectedPreset(preset);
        },
        [setSelectedPreset],
    );

    const navigateBackToPresets = useCallback((): void => {
        setState((prevState) => ({ ...prevState, activeContentId: ContentId.PRESETS_CONTENT_ID }));
    }, []);

    const restoreSelectedDateDataset = useCallback((): void => {
        setSelectedDateDataset(propsSelectedDateDataset || undefined);
    }, [propsSelectedDateDataset, setSelectedDateDataset]);

    const requestDateDataSets = useCallback((): void => {
        const measureLocalIdentifier: string = bucketItem.localIdentifier;
        requestMeasureDateDatasets(measureLocalIdentifier);
    }, [bucketItem, requestMeasureDateDatasets]);

    const storedAdditionalDateFilters = useMemo(
        () => additionalDateFilters.map(metricFilterToAttributeFilter),
        [additionalDateFilters],
    );
    const additionalDateFilterLabels = useMemo(
        () => buildMeasureAdditionalDateFilterLabels(additionalDateFilters, dateAttributes),
        [additionalDateFilters, dateAttributes],
    );

    // Like the filter bar's date filter, a metric date filter exists from the moment it is added, as
    // All time (a no-op the execution drops); the picker then edits it. The additional date filters
    // the metric may already carry are kept. A filter needs its date dataset, so when the measure's
    // date datasets are still loading the add waits for them (see the effect below).
    // only the primary date filter edits the additional date filters
    const areAdditionalDateFiltersSupported = areAdditionalDateFiltersSupportedProp && isPrimaryDateFilter;

    const addAllTimeDateFilter = useCallback(
        (dateDataset: IDecoratedDateDataset): void => {
            onApply?.({
                dateFilter: undefined,
                dateFilterOption: { filterOption: ALL_TIME_FILTER_OPTION, excludeCurrentPeriod: false },
                dateDatasetIdentifier: dateDataset.identifier,
                additionalDateFilters: storedAdditionalDateFilters,
            });
            updateDateFilter({ name: ALL_TIME });
        },
        [onApply, storedAdditionalDateFilters, updateDateFilter],
    );
    const isAllTimeAddPendingRef = useRef(false);

    useEffect(() => {
        if (!state.displayDropdown) {
            isAllTimeAddPendingRef.current = false;
            return;
        }
        if (isAllTimeAddPendingRef.current && !dateDatasetsIsLoading && propsSelectedDateDataset) {
            isAllTimeAddPendingRef.current = false;
            addAllTimeDateFilter(propsSelectedDateDataset);
        }
    }, [state.displayDropdown, dateDatasetsIsLoading, propsSelectedDateDataset, addAllTimeDateFilter]);

    const dropdownToggle = useCallback((): void => {
        if (isDisabled()) {
            return;
        }

        const displayDropdown = !state.displayDropdown;

        if (displayDropdown) {
            restoreSelectedDateDataset();
            requestDateDataSets();
            if (isImprovedMetricDateFilterEnabled && !getOriginalDateFilter(filter)) {
                if (propsSelectedDateDataset) {
                    addAllTimeDateFilter(propsSelectedDateDataset);
                } else {
                    isAllTimeAddPendingRef.current = true;
                }
            } else {
                restoreView();
            }
            setDropdownHeight();

            const originalDateFilter = getOriginalDateFilter(filter);
            const currentGranularity = originalDateFilter?.granularity as DateFilterGranularity | undefined;

            // Determine default tab based on current granularity
            let defaultTab: CalendarTabType = "standard";
            if (currentGranularity) {
                if (isFiscalGranularity(currentGranularity)) {
                    defaultTab = "fiscal";
                } else if (!STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT.includes(currentGranularity)) {
                    // Shared granularity (week/date) - use activeCalendars.default
                    defaultTab =
                        activeCalendars?.fiscal && activeCalendars?.default === "FISCAL"
                            ? "fiscal"
                            : "standard";
                }
            } else {
                // No granularity - use activeCalendars.default
                defaultTab =
                    activeCalendars?.fiscal && activeCalendars?.default === "FISCAL" ? "fiscal" : "standard";
            }

            setState((prevState) => ({ ...prevState, displayDropdown, selectedTab: defaultTab }));
        } else {
            setState((prevState) => ({ ...prevState, displayDropdown }));
        }
    }, [
        isDisabled,
        state.displayDropdown,
        restoreSelectedDateDataset,
        requestDateDataSets,
        isImprovedMetricDateFilterEnabled,
        propsSelectedDateDataset,
        addAllTimeDateFilter,
        restoreView,
        setDropdownHeight,
        filter,
        activeCalendars,
        getOriginalDateFilter,
    ]);

    const isAutoOpenHandledRef = useRef(false);
    useEffect(() => {
        if (autoOpen && !isAutoOpenHandledRef.current) {
            isAutoOpenHandledRef.current = true;
            dropdownToggle();
        }
    }, [autoOpen, dropdownToggle]);

    const wasDropdownOpenRef = useRef(false);
    useEffect(() => {
        if (wasDropdownOpenRef.current && !state.displayDropdown) {
            onDropdownClosed?.();
        }
        wasDropdownOpenRef.current = state.displayDropdown;
    }, [state.displayDropdown, onDropdownClosed]);

    const removeDateFilter = useCallback((): void => {
        // with the shared picker the additional date filters belong to the date filter and leave with
        // it — unless the picker cannot show them, in which case they are listed as regular filters
        onRemove(filter.original, isImprovedMetricDateFilterEnabled && areAdditionalDateFiltersSupported);

        updateDateFilter();
    }, [
        onRemove,
        filter,
        isImprovedMetricDateFilterEnabled,
        areAdditionalDateFiltersSupported,
        updateDateFilter,
    ]);

    const applyDateFilterOption = useCallback(
        (
            option: IDateFilterOption,
            additional: IAttributeFilter[],
            emptyDateValuesFilter: EmptyDateValuesFilterMode | undefined,
        ): void => {
            onApply?.({
                dateFilter: filter?.original ?? undefined,
                dateFilterOption: option,
                dateDatasetIdentifier: state.selectedDateDataset.identifier,
                additionalDateFilters: additional,
                emptyDateValuesFilter,
            });

            updateDateFilter(optionToMeasureDateFilterInterval(option));
            closeDropdown();
        },
        [onApply, filter, state.selectedDateDataset, updateDateFilter, closeDropdown],
    );

    const getDropdownClasses = useCallback((): string => {
        return classNames(
            "overlay",
            "gd-dialog",
            "gd-dropdown",
            "adi-filter-picker",
            "adi-date-filter-picker",
            "adi-metric-date-filter-picker",
            "s-metric-date-filter-dropdown",
        );
    }, []);

    const getButtonClassNames = useCallback((): string => {
        const isOpen = state.displayDropdown;

        return classNames(
            [
                `s-${bucketLocalIdentifier}-bucket-id`,
                "s-metric-date-filter-button",
                "type-date",
                "gd-button-link",
                "button-dropdown",
                "gd-icon-right",
                `${bucketLocalIdentifier}-bucket-id`,
                "metric-date-filter-button",
                "adi-filter-button",
            ],
            {
                "gd-icon-navigateup": isOpen && hasDateFilter(),
                "gd-icon-navigatedown": !isOpen && hasDateFilter(),
                "is-active": isOpen,
                "is-set": hasDateFilter(),
                disabled: isDisabled(),
            },
        );
    }, [state.displayDropdown, bucketLocalIdentifier, hasDateFilter, isDisabled]);

    const getContentClasses = useCallback(
        (contentId: string): string => {
            const isSelected = (state.activeContentId as string) === contentId;

            return classNames(`adi-${contentId}-picker-content`, `s-${contentId}-picker-content`, {
                "s-is-selected": isSelected,
                invisible: !isSelected,
            });
        },
        [state.activeContentId],
    );

    const onDateDatasetDropdownOpenStateChanged = useCallback(
        (isOpen: boolean) => {
            const ignoreDateDataset = false;
            if (isOpen) {
                callLoadDateDatasetsToDateDropdown(ignoreDateDataset);
            }
        },
        [callLoadDateDatasetsToDateDropdown],
    );

    // UNSAFE_componentWillMount equivalent
    useEffect(() => {
        restoreView();
    }, []); // oxlint-disable-line react-hooks/exhaustive-deps

    // componentDidMount equivalent
    useEffect(() => {
        subscribersRef.current = subscribeEvents(setDropdownHeight);

        // componentWillUnmount equivalent (cleanup)
        return () => {
            subscribersRef.current.forEach((subscriber) => {
                subscriber.unsubscribe();
            });
            subscribersRef.current = null;
        };
    }, [setDropdownHeight]);

    // UNSAFE_componentWillReceiveProps equivalent
    useEffect(() => {
        if (!state.selectedDateDataset && propsSelectedDateDataset) {
            setSelectedDateDataset(propsSelectedDateDataset);
        } else {
            const decoratedActiveDateDataset =
                state.selectedDateDataset &&
                dateDatasetsList.find(
                    (dateDataset) => dateDataset.identifier === state.selectedDateDataset.identifier,
                );

            if (!decoratedActiveDateDataset && propsSelectedDateDataset) {
                setSelectedDateDataset(propsSelectedDateDataset);
            }
        }
    }, [propsSelectedDateDataset, dateDatasetsList, state.selectedDateDataset, setSelectedDateDataset]);

    const renderNavigateBack = (): ReactElement => {
        return (
            <div className="navigate-back-header s-navigate-back-header" onClick={navigateBackToPresets}>
                <span className="navigate-header-icon gd-icon-navigateleft" />
                <span className="navigate-header-label">
                    <FormattedMessage id="filter.date.navigate.back" tagName="span" />
                </span>
            </div>
        );
    };

    const getSelectedDatasetGranularities = (): DateFilterGranularity[] => {
        if (!state.selectedDateDataset) {
            return [];
        }
        const datasetWithGranularities = dateDatasetRefsWithGranularities.find(({ ref }) =>
            areObjRefsEqual(ref, state.selectedDateDataset.ref),
        );
        return (
            datasetWithGranularities?.attributes
                .map((attr) => attr.dateType)
                .filter(isDateFilterGranularity) || []
        );
    };

    const getFiscalTabsConfigForPresets = (
        supportedGranularities: DateFilterGranularity[],
    ): IFiscalTabsConfig => {
        const datasetHasFiscal = supportedGranularities.some((g) => isFiscalGranularity(g));
        const datasetHasStandard = supportedGranularities.some((g) => !isFiscalGranularity(g));

        const hasFiscal = activeCalendars ? activeCalendars.fiscal && datasetHasFiscal : false;
        const hasStandard = activeCalendars
            ? activeCalendars.standard && datasetHasStandard
            : datasetHasStandard;

        return {
            hasFiscal,
            hasStandard,
            showTabs: hasFiscal && hasStandard,
        };
    };

    const handleTabChange = (tab: CalendarTabType) => {
        setState((prevState) => ({ ...prevState, selectedTab: tab }));
    };

    const renderPresets = (): ReactElement => {
        const supportedGranularities = getSelectedDatasetGranularities();
        const fiscalTabsConfig = getFiscalTabsConfigForPresets(supportedGranularities);

        // Maps preset header names to their granularities for filtering
        // OTHER ("Static period") has no granularity - always shown
        const headerToGranularity: Record<string, DateFilterGranularity | typeof OTHER> = {
            year: "GDC.time.year",
            quarter: "GDC.time.quarter",
            month: "GDC.time.month",
            week: "GDC.time.week_us",
            day: "GDC.time.date",
            fiscal_year: "GDC.time.fiscal_year",
            fiscal_quarter: "GDC.time.fiscal_quarter",
            fiscal_month: "GDC.time.fiscal_month",
            [OTHER]: OTHER,
        };

        const isFiscalPreset = (preset: IDecoratedPresetItem): boolean => {
            const granularity = preset.granularity as DateFilterGranularity | undefined;
            const header = preset.header;
            return (granularity && isFiscalGranularity(granularity)) || header?.includes("fiscal");
        };

        const isSharedPreset = (preset: IDecoratedPresetItem): boolean => {
            const granularity = preset.granularity as DateFilterGranularity | undefined;
            const header = preset.header;
            const name = preset.name;

            // Static period and its header have no granularity - always shared
            if (header === OTHER || name === STATIC_PERIOD) {
                return true;
            }

            // Shared = not fiscal AND not standard-with-fiscal-equivalent
            // This includes: week, date, hour, minute
            return (
                granularity &&
                !isFiscalGranularity(granularity) &&
                !STANDARD_GRANULARITIES_WITH_FISCAL_EQUIVALENT.includes(granularity)
            );
        };

        // Filter by date dataset's available granularities
        let filteredPresets = MEASURE_DATE_FILTER_PRESETS.filter((preset) => {
            const granularity = preset.granularity as DateFilterGranularity | undefined;
            const header = preset.header;

            // Headers are kept if their corresponding granularity is supported
            if (header) {
                const mappedGranularity = headerToGranularity[header];
                // Static period header is always shown (no granularity restriction)
                if (mappedGranularity === OTHER) {
                    return true;
                }
                // If no granularity info available, show all headers
                return (
                    supportedGranularities.length === 0 ||
                    (mappedGranularity &&
                        supportedGranularities.includes(mappedGranularity as DateFilterGranularity))
                );
            }

            // If no granularity info available, show all presets (don't filter)
            return (
                !granularity ||
                supportedGranularities.length === 0 ||
                supportedGranularities.includes(granularity)
            );
        });

        // Filter by calendar type based on fiscalTabsConfig
        if (fiscalTabsConfig.showTabs) {
            // Both calendars available - filter by selected tab
            filteredPresets = filteredPresets.filter((preset) => {
                if (state.selectedTab === "fiscal") {
                    // Show fiscal + shared (week, date, other)
                    return isFiscalPreset(preset) || isSharedPreset(preset);
                } else {
                    // Show standard + shared (week, date, other)
                    return !isFiscalPreset(preset);
                }
            });
        } else if (fiscalTabsConfig.hasFiscal && !fiscalTabsConfig.hasStandard) {
            // Only fiscal calendar enabled - show only fiscal + shared
            filteredPresets = filteredPresets.filter((preset) => {
                return isFiscalPreset(preset) || isSharedPreset(preset);
            });
        } else {
            // Only standard calendar enabled (or none/undefined) - show only standard + shared
            filteredPresets = filteredPresets.filter((preset) => {
                return !isFiscalPreset(preset);
            });
        }

        return (
            <div className="adi-metric-date-filter-presets" style={{ height: state.dropdownHeight }}>
                {fiscalTabsConfig.showTabs ? (
                    <CalendarTypeTabs selectedTab={state.selectedTab} onTabSelect={handleTabChange} />
                ) : null}
                <DateFilterPresets
                    presets={filteredPresets}
                    selectedPreset={state.preset}
                    tagName={"section"}
                    className={"adi-tab-presets"}
                    onSelectPreset={onSelectPreset}
                />
            </div>
        );
    };

    const renderDimensionsSelect = (): ReactElement => {
        return (
            <div className="adi-date-dropdown adi-date-dataset-select">
                <span className="select">
                    <FormattedMessage id="filter" tagName="span" />
                    {state.activeContentId === ContentId.PRESETS_CONTENT_ID && (
                        // DateDatasetsDropdown has to be unmounted here, not just hidden by .invisible selector,
                        // otherwise it does not recalculate dropdown dimensions properly.
                        <DateDatasetsDropdown
                            className="s-filter-date-date-dataset-switch adi-date-dataset-select-dropdown"
                            unavailableCount={dateDatasetsUnavailableCount}
                            dateDatasets={dateDatasetsList}
                            activeDateDataset={state.selectedDateDataset}
                            onDateDatasetChange={onDateDatasetChange}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            onOpenStateChanged={onDateDatasetDropdownOpenStateChanged}
                            isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                            enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
                        />
                    )}
                    <FormattedMessage id="filter.date.date-dataset.to" tagName="span" />
                </span>
            </div>
        );
    };

    const renderNoDateDatasets = (): ReactElement => {
        return (
            <div className="adi-picker-content">
                <div className="adi-date-dropdown">
                    <NoData
                        className="s-no-date-dataset-message"
                        noDataLabel={intl.formatMessage({ id: "gs.noData.noDataAvailable" })}
                    />
                    <div className="gd-list-footer">
                        <FormattedMessage
                            id="date.date-dataset.unrelated_hidden"
                            values={{ count: dateDatasetsUnavailableCount }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderImprovedContent = (): ReactElement => {
        if (!dateDatasetsIsLoading && (isEmpty(dateDatasetsList) || !state.selectedDateDataset)) {
            return renderNoDateDatasets();
        }

        // While the date datasets load, the picker renders what it will show once they arrive (the stored
        // period, or All time for a new filter) under a spinner layer, so the dropdown gets its final size
        // up front instead of jumping. The key remounts it after loading, dropping state built meanwhile.
        return (
            <div className="adi-metric-date-filter-content" aria-busy={dateDatasetsIsLoading}>
                {dateDatasetsIsLoading ? (
                    <div className="adi-metric-date-filter-loading-layer s-metric-date-filter-loading">
                        <div className="dropdown-loading" />
                    </div>
                ) : null}
                <MeasureDateFilterPicker
                    key={dateDatasetsIsLoading ? "loading" : "loaded"}
                    filter={measureDateFilterToOption(filter)}
                    dateDataset={state.selectedDateDataset ?? LOADING_PLACEHOLDER_DATE_DATASET}
                    appliedDateDataset={propsSelectedDateDataset}
                    dateDatasets={{ items: dateDatasetsList, unavailable: dateDatasetsUnavailableCount }}
                    onDateDatasetChange={onDateDatasetChange}
                    loadDateDatasets={() => callLoadDateDatasetsToDateDropdown(false)}
                    isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                    enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
                    relativeDateFilterPresets={relativeDateFilterPresets}
                    dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
                    dateFormat={dateFormat}
                    isTimeForAbsoluteRangeEnabled={isTimeForAbsoluteRangeEnabled}
                    isSecondsGranularityEnabled={isSecondsGranularityEnabled}
                    weekStart={weekStart}
                    activeCalendars={activeCalendars}
                    additionalDateAttributeFilters={storedAdditionalDateFilters}
                    areAdditionalDateFiltersSupported={areAdditionalDateFiltersSupported}
                    emptyDateValuesFilter={filter?.original?.emptyDateValuesFilter}
                    onApply={applyDateFilterOption}
                    onCancel={closeDropdown}
                />
            </div>
        );
    };

    const renderContent = (): ReactElement => {
        if (isImprovedMetricDateFilterEnabled) {
            return renderImprovedContent();
        }

        if (dateDatasetsIsLoading) {
            return <LoadingDropdown />;
        }

        if (isEmpty(dateDatasetsList) || !state.selectedDateDataset) {
            return renderNoDateDatasets();
        }

        return (
            <div className="adi-picker-content">
                <div className={getContentClasses(ContentId.PRESETS_CONTENT_ID)}>
                    {renderDimensionsSelect()}
                    {renderPresets()}
                </div>
                <div className={getContentClasses(ContentId.DATE_RANGE_CONTENT_ID)}>
                    {renderNavigateBack()}
                    <MeasureDateRangePicker
                        dateFormat={dateFormat}
                        start={state.start}
                        end={state.end}
                        onApply={applyDateRangeChange}
                        onCancel={closeDropdown}
                    />
                </div>
            </div>
        );
    };

    const renderDropdown = (): ReactElement => {
        if (!state.displayDropdown) {
            return null;
        }

        if (isImprovedMetricDateFilterEnabled) {
            return (
                <FilterDropdownOverlay alignTo={buttonRef} onClose={closeDropdown}>
                    {renderContent()}
                </FilterDropdownOverlay>
            );
        }

        return (
            <Overlay
                onClose={closeDropdown}
                alignTo={`.metric-date-filter-button.${bucketLocalIdentifier}-bucket-id`}
                alignPoints={DROPDOWN_ALIGNMENTS}
                closeOnOutsideClick
                closeOnParentScroll
                closeOnMouseDrag
            >
                <div className={getDropdownClasses()}>{renderContent()}</div>
            </Overlay>
        );
    };

    const renderRemoveButton = (): ReactElement => {
        if (!hasDateFilter()) {
            return null;
        }

        const removeButtonClasses = classNames([
            "gd-button-link",
            "gd-button-icon-only",
            "gd-icon-cross",
            "remove-filter",
            "s-remove-date-filter",
        ]);

        return <Button className={removeButtonClasses} onClick={removeDateFilter} />;
    };

    const renderAddButtonLabel = (): ReactElement => {
        const option = isImprovedMetricDateFilterEnabled ? measureDateFilterToOption(filter) : undefined;
        if (option) {
            return (
                <div className="adi-date-filter-label">
                    <MeasureDateFilterTitle
                        filter={option}
                        attributeTitle={DecoratedDateFilter.getAttributeTitle(filter)}
                        dateFormat={dateFormat}
                        additionalDateFilterLabels={additionalDateFilterLabels}
                        emptyDateValuesFilterMode={filter?.original?.emptyDateValuesFilter}
                    />
                </div>
            );
        }

        return (
            <div className="adi-date-filter-label">
                <ShortenedText className={"shortened-text"} tooltipAlignPoints={tooltipAlignPoints}>
                    {DecoratedDateFilter.getTitle(filter, intl, formatLocale)}
                </ShortenedText>
            </div>
        );
    };

    const renderAddButton = (): ReactElement => {
        const buttonLabel = hasDateFilter()
            ? renderAddButtonLabel()
            : intl.formatMessage({ id: "dashboard.bucket.filter_by_date" });

        return (
            <div
                ref={(element) => {
                    buttonRef.current = element;
                }}
                className={getButtonClassNames()}
                onClick={dropdownToggle}
            >
                {buttonLabel}
            </div>
        );
    };

    const renderDisabledAddButton = (): ReactElement => {
        return (
            <BubbleHoverTrigger>
                {renderAddButton()}
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tl" }, { align: "tc bl" }]}>
                    <FormattedMessage id="filter.date.disabled_compare" />
                </Bubble>
            </BubbleHoverTrigger>
        );
    };

    return (
        <div className="metric-filter-wrapper s-metric-filter-wrapper">
            <span>
                {isDisabled() ? renderDisabledAddButton() : renderAddButton()}
                {renderDropdown()}
            </span>
            {renderRemoveButton()}
        </div>
    );
}

const mapStateToProps = (
    state: IAppState,
    ownProps: IMeasureDateFilterOwnProps,
): IMeasureDateFilterStateProps => ({
    ...measureDateFilterSelector(state, ownProps),
    isImprovedMetricDateFilterEnabled: enableImprovedMetricDateFilter(state),
    relativeDateFilterPresets: selectRelativeDateFilterPresets(state),
    isTimeForAbsoluteRangeEnabled: supportsTimeGranularities(),
    isSecondsGranularityEnabled: selectIsSecondsGranularityEnabled(state),
    weekStart: getWeekStart(state),
    areAdditionalDateFiltersSupported: areGenericDateAttributeElementsSupported(),
    dateAttributes: getDateAttributes(state),
});

export const MeasureDateFilter = connect<
    IMeasureDateFilterStateProps,
    object,
    IMeasureDateFilterOwnProps,
    IAppState
>(
    mapStateToProps,
    actions,
)(MeasureDateFilterBase);
