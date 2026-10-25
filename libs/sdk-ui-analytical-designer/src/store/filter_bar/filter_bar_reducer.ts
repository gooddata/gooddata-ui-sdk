// (C) 2019-2026 GoodData Corporation

import { type AppContextActions } from "../../actions/app_context_actions.js";
import { openReportFinished } from "../../actions/open_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import { arithmeticMeasureOperandSelected } from "../arithmetic_measures/arithmetic_measures_operation_events.js";
import {
    storeSetBucketItemUpdateMetricFilterDisplayForm,
    storeUpdateAttributeFilterDisplayForm,
} from "../bucket_filters/bucket_filters_actions.js";
import {
    attributeFilterUpdated,
    dateFilterDateDatasetChanged,
    dateFilterUpdated,
    filterItemsUpdatedFromCommand,
    measureDateFilterApplied,
    measureFilterAdded,
    measureFilterRemoved,
    measureFilterUpdated,
    measureValueFilterUpdated,
    rankingFilterUpdated,
} from "../bucket_filters/bucket_filters_operation_events.js";
import {
    bucketItemAdded,
    bucketItemReplaced,
    bucketItemsRemoved,
    extendedReferencePointApplied,
    filterRemovalApplied,
} from "../buckets/buckets_operation_events.js";
import { recommendationApplied } from "../recommendations/recommendations_operation_events.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
} from "../shortcuts/shortcuts_operation_events.js";

import {
    type FilterBarActionType,
    FilterBarActionTypeKeys,
    type IAddFiltersToStateAction,
    type IRemoveFiltersFromStateAction,
    type ISetMultilineFilterBarAction,
    type IStoreMigratedAdditionalFiltersAction,
    type IUpdateAttributeFilterConfigsInStateAction,
} from "./filter_bar_actions.js";
import { storeAttributeFilterDisplayAsLabel } from "./filter_bar_helpers.js";
import { type IFilterBarState, defaultFilterBarState } from "./filter_bar_state.js";
import {
    type IAddParameterFiltersAction,
    type IRemoveParameterFiltersAction,
    type IStoreUpdateParameterFilterAction,
    type ParameterFilterActionType,
    ParameterFilterActionTypeKeys,
} from "./parameter_filter_actions.js";

const addFilters = (state: IFilterBarState, action: IAddFiltersToStateAction) => {
    return {
        ...state,
        items: [...state.items, ...action.payload.items],
    };
};

const removeFilters = (state: IFilterBarState, action: IRemoveFiltersFromStateAction) => {
    const filteredItems = state.items.filter((item) =>
        action.payload.localIdentifiers.every((localIdentifier) => localIdentifier !== item.localIdentifier),
    );

    return {
        ...state,
        items: filteredItems,
    };
};

const setMultiline = (state: IFilterBarState, action: ISetMultilineFilterBarAction): IFilterBarState => {
    return {
        ...state,
        isMultiline: action.payload.isMultiLine,
    };
};

const setMigratedAdditionalFilters = (
    state: IFilterBarState,
    action: IStoreMigratedAdditionalFiltersAction,
): IFilterBarState => {
    return {
        ...state,
        migratedAdditionalFilters: action.payload.filterLocalIdentifiers,
    };
};

const toggleFilterDropdown = (state: IFilterBarState): IFilterBarState => {
    return {
        ...state,
        filterBarDropdownOpen: !state.filterBarDropdownOpen,
    };
};

const openFilterDropdown = (state: IFilterBarState): IFilterBarState => {
    return {
        ...state,
        filterBarDropdownOpen: true,
    };
};

const closeFilterDropdown = (state: IFilterBarState): IFilterBarState => {
    return {
        ...state,
        filterBarDropdownOpen: false,
    };
};

const updateAttributeFilterConfigs = (
    state: IFilterBarState,
    action: IUpdateAttributeFilterConfigsInStateAction,
) => {
    return {
        ...state,
        attributeFilterConfigs: {
            ...action.payload.attributeFilterConfigs,
        },
    };
};

const addParameterFilters = (state: IFilterBarState, action: IAddParameterFiltersAction): IFilterBarState => {
    return {
        ...state,
        parameterItems: [...state.parameterItems, ...action.payload.items],
    };
};

const removeParameterFilters = (
    state: IFilterBarState,
    action: IRemoveParameterFiltersAction,
): IFilterBarState => {
    const { localIdentifiers } = action.payload;
    return {
        ...state,
        parameterItems: state.parameterItems.filter(
            (item) => !localIdentifiers.includes(item.localIdentifier),
        ),
    };
};

const storeUpdateParameterFilter = (
    state: IFilterBarState,
    action: IStoreUpdateParameterFilterAction,
): IFilterBarState => {
    const { filter } = action.payload;
    return {
        ...state,
        parameterItems: state.parameterItems.map((item) =>
            item.localIdentifier === filter.localIdentifier ? filter : item,
        ),
    };
};

/**
 * The buckets-family operations that decide the FILTER BAR.
 *
 * The removal chain rescues filters that can survive a bucket item's departure and drops the ones that
 * cannot, so five buckets operations end up owning a filter-bar value. This reducer is hand-written
 * rather than a slice, so the "explicit case per event" is written out — same shape a slice gets.
 *
 * `extendedReferencePointApplied` is in the list because a pluggable visualization's answer replaces the
 * filter bar's ITEMS (`setFilterItems`), which is the one place the plug viz gets to.
 */
const BUCKETS_OPERATION_FILTER_BAR_WRITERS = [
    bucketItemAdded,
    bucketItemsRemoved,
    bucketItemReplaced,
    extendedReferencePointApplied,
    filterRemovalApplied,
    // an arithmetic operand that is itself derived removes the measure's derivative,
    // and the removal chain rescues/drops filters exactly like the four above
    arithmeticMeasureOperandSelected,
    // four of the five recommendations create/update the date filter
    recommendationApplied,
    // the shortcut applies compose the add operation; over-time sets the date filter
    metricShortcutApplied,
    metricOverTimeShortcutApplied,
    // the bucket-filters family — this domain's OWN gestures, so all nine events carry a
    // filter-bar value (unchanged ones by reference)
    attributeFilterUpdated,
    dateFilterUpdated,
    dateFilterDateDatasetChanged,
    filterItemsUpdatedFromCommand,
    measureValueFilterUpdated,
    rankingFilterUpdated,
    measureFilterAdded,
    measureFilterRemoved,
    measureFilterUpdated,
    measureDateFilterApplied,
] as const;

export const filterBarReducer = (
    state = defaultFilterBarState,
    action: FilterBarActionType | ParameterFilterActionType | AppContextActions,
) => {
    for (const event of BUCKETS_OPERATION_FILTER_BAR_WRITERS) {
        if (event.match(action as never)) {
            // `match` is the runtime proof; TS cannot carry a type predicate through a loop over a
            // union of creators, and each event's type string is a LITERAL, so the domain action and
            // the event do not overlap structurally — hence the widening step.
            return (action as unknown as ReturnType<typeof event>).payload.filterBar;
        }
    }

    // the application resets — this replaces the RESET_APPLICATION case below AND the
    // transformer's clearInsightContent write; the scopes live in
    // store/app_context/application_reset_events.ts
    if (isInsightContentResetEvent(action)) {
        return defaultFilterBarState;
    }

    // opening a report lands the loaded filter/parameter items and attribute-filter
    // configs — the open-report operation composed this domain's own helpers over the previous
    // value (store/report/open_report_operation.ts)
    if (openReportFinished.match(action as never)) {
        return (action as unknown as ReturnType<typeof openReportFinished>).payload.result.filterBar;
    }

    // the two display-form triggers are not cascades: each writes ONE filter's `displayAsLabel`
    // config and nothing else, so they are cases on the TRIGGER. The bucket-item variant carries a
    // wider payload (the item and the primary display form for the saga's follow-up), but the write
    // is the same one.
    if (
        storeUpdateAttributeFilterDisplayForm.match(action as never) ||
        storeSetBucketItemUpdateMetricFilterDisplayForm.match(action as never)
    ) {
        const { filterLocalIdentifier, displayAsDfRef } = (
            action as unknown as
                | ReturnType<typeof storeUpdateAttributeFilterDisplayForm>
                | ReturnType<typeof storeSetBucketItemUpdateMetricFilterDisplayForm>
        ).payload;
        return storeAttributeFilterDisplayAsLabel(state, filterLocalIdentifier, displayAsDfRef);
    }

    switch (action.type) {
        case FilterBarActionTypeKeys.STORE_ADD_FILTERS_TO_STATE:
            return addFilters(state, action);
        case FilterBarActionTypeKeys.STORE_REMOVE_FILTERS_FROM_STATE:
            return removeFilters(state, action);
        case FilterBarActionTypeKeys.STORE_SET_MULTILINE_FILTER_BAR:
            return setMultiline(state, action);
        case FilterBarActionTypeKeys.STORE_TOGGLE_FILTER_DROPDOWN:
            return toggleFilterDropdown(state);
        case FilterBarActionTypeKeys.STORE_OPEN_FILTER_DROPDOWN:
            return openFilterDropdown(state);
        case FilterBarActionTypeKeys.STORE_CLOSE_FILTER_DROPDOWN:
            return closeFilterDropdown(state);
        case FilterBarActionTypeKeys.STORE_MIGRATED_ADDITIONAL_FILTERS:
            return setMigratedAdditionalFilters(state, action);
        case FilterBarActionTypeKeys.STORE_UPDATE_ATTRIBUTE_FILTER_CONFIGS_IN_STATE:
            return updateAttributeFilterConfigs(state, action);
        case ParameterFilterActionTypeKeys.STORE_ADD_PARAMETER_FILTERS:
            return addParameterFilters(state, action);
        case ParameterFilterActionTypeKeys.STORE_REMOVE_PARAMETER_FILTERS:
            return removeParameterFilters(state, action);
        case ParameterFilterActionTypeKeys.STORE_UPDATE_PARAMETER_FILTER:
            return storeUpdateParameterFilter(state, action);
        default:
            return state;
    }
};
