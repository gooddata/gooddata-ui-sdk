// (C) 2021-2025 GoodData Corporation

import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardDateFilterConfig,
    type IDashboardFilterView,
    type IFilterContextDefinition,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link DashboardDateFilterSelectionChanged} event.
 *
 * @remarks
 *
 * See also {@link dashboardDateFilterToDateFilterByWidget} and {@link dashboardDateFilterToDateFilterByDateDataSet} convertors
 * – those allow you to convert the `filter` object to an {@link @gooddata/sdk-model#IDateFilter} instance you can use
 * with visualizations, filter UI components and so on.
 *
 * @public
 */
export interface DashboardDateFilterSelectionChangedPayload {
    /**
     * Object with changed date filter selection.
     */
    readonly filter: IDashboardDateFilter | undefined;
    /**
     * Optional local identifier of the new selected date filter option.
     */
    readonly dateFilterOptionLocalId?: string;
}

/**
 * This event is emitted after the dashboard's date filter selection is changed.
 *
 * @remarks
 *
 * See also {@link dashboardDateFilterToDateFilterByWidget} and {@link dashboardDateFilterToDateFilterByDateDataSet} convertors
 * – those allow you to convert the `filter` in the event payload to an {@link @gooddata/sdk-model#IDateFilter} instance you can use
 * with visualizations, filter UI components and so on.
 *
 * @public
 */
export interface DashboardDateFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED";
    readonly payload: DashboardDateFilterSelectionChangedPayload;
}

export function dateFilterChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter | undefined,
    dateFilterOptionLocalId?: string,
    correlationId?: string,
): DashboardDateFilterSelectionChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
            dateFilterOptionLocalId,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterSelectionChanged}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardDateFilterSelectionChanged = eventGuard<DashboardDateFilterSelectionChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterAdded} event.
 * @beta
 */
export interface DashboardAttributeFilterAddedPayload {
    /**
     * Definition of the created attribute filter. The filter's local identifier can be used in subsequent
     * commands to identify this filter.
     */
    readonly added: IDashboardAttributeFilter;

    /**
     * Zero-based index indicating the position of the attribute filter among the other filters.
     */
    readonly index: number;
}

/**
 * This event is emitted after a new dashboard attribute filter is successfully added into dashboard's
 * filters.
 *
 * @beta
 */
export interface DashboardAttributeFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED";
    readonly payload: DashboardAttributeFilterAddedPayload;
}

export function attributeFilterAdded(
    ctx: DashboardContext,
    added: IDashboardAttributeFilter,
    index: number,
    correlationId?: string,
): DashboardAttributeFilterAdded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
        ctx,
        correlationId,
        payload: {
            added,
            index,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterAdded = eventGuard<DashboardAttributeFilterAdded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterRemoved} event.
 * @beta
 */
export interface DashboardAttributeFilterRemovedPayload {
    /**
     * The dashboard attribute filter that has been removed.
     */
    readonly removed: IDashboardAttributeFilter;

    /**
     * If the removed filter figured as a parent filter for some other filters, then
     * those children have lost their parent - the relationship was removed.
     *
     * If any children filters were impacted by the removal, their new definition that does
     * not include the parent relationship is included here.
     */
    readonly children?: ReadonlyArray<IDashboardAttributeFilter>;
}

/**
 * This event is emitted after a dashboard attribute filter is successfully removed.
 *
 * If the removed filter figured as a parent to one or more child filters, then the removal
 * also cleaned up the parent relationship.
 *
 * @beta
 */
export interface DashboardAttributeFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED";
    readonly payload: DashboardAttributeFilterRemovedPayload;
}

export function attributeFilterRemoved(
    ctx: DashboardContext,
    removed: IDashboardAttributeFilter,
    children?: IDashboardAttributeFilter[],
    correlationId?: string,
): DashboardAttributeFilterRemoved {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
        ctx,
        correlationId,
        payload: {
            removed,
            children,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterRemoved = eventGuard<DashboardAttributeFilterRemoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterMoved} event.
 * @beta
 */
export interface DashboardAttributeFilterMovedPayload {
    /**
     * Definition of the dashboard attribute filter that was moved.
     */
    readonly moved: IDashboardAttributeFilter;

    /**
     * The original position of the filter.
     */
    readonly fromIndex: number;

    /**
     * New absolute position of the filter.
     */
    readonly toIndex: number;
}

/**
 * This event is emitted after a dashboard attribute filter is moved from one position in the filter bar
 * to a new position
 *
 * @beta
 */
export interface DashboardAttributeFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED";
    readonly payload: DashboardAttributeFilterMovedPayload;
}

export function attributeFilterMoved(
    ctx: DashboardContext,
    moved: IDashboardAttributeFilter,
    fromIndex: number,
    toIndex: number,
    correlationId?: string,
): DashboardAttributeFilterMoved {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED",
        ctx,
        correlationId,
        payload: {
            moved,
            fromIndex,
            toIndex,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterMoved = eventGuard<DashboardAttributeFilterMoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterSelectionChanged} event.
 *
 * @remarks
 *
 * See also {@link dashboardAttributeFilterToAttributeFilter} convertor – this allows you to convert the `filter`
 * object to an {@link @gooddata/sdk-model#IAttributeFilter} instance you can use with visualizations,
 * filter UI components and so on.
 *
 * @public
 */
export interface DashboardAttributeFilterSelectionChangedPayload {
    /**
     * The update definition of the dashboard attribute filter.
     *
     * The attribute elements and/or the negativeSelection indicator values have changed.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted after new elements are selected and applied in an attribute filter.
 *
 * @remarks
 *
 * See also {@link dashboardAttributeFilterToAttributeFilter} convertor – this allows you to convert the `filter`
 * in the event payload to an {@link @gooddata/sdk-model#IAttributeFilter} instance you can use with visualizations,
 * filter UI components and so on.
 *
 * @public
 */
export interface DashboardAttributeFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED";
    readonly payload: DashboardAttributeFilterSelectionChangedPayload;
}

export function attributeFilterSelectionChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): DashboardAttributeFilterSelectionChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterSelectionChanged}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardAttributeFilterSelectionChanged =
    eventGuard<DashboardAttributeFilterSelectionChanged>(
        "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterParentChanged} event.
 * @beta
 */
export interface DashboardAttributeFilterParentChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of parents represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted after the parent relationships of a filter change.
 *
 * @beta
 */
export interface DashboardAttributeFilterParentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED";
    readonly payload: DashboardAttributeFilterParentChangedPayload;
}

export function attributeFilterParentChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): DashboardAttributeFilterParentChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterParentChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterParentChanged = eventGuard<DashboardAttributeFilterParentChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeTitleChanged} event.
 * @beta
 */
export interface DashboardAttributeTitleChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of parents represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted when the attribute filter title change.
 *
 * @beta
 */
export interface DashboardAttributeTitleChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED";
    readonly payload: DashboardAttributeTitleChangedPayload;
}

export function attributeDisplayTitleChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): DashboardAttributeTitleChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeTitleChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterTitleChanged = eventGuard<DashboardAttributeTitleChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
);

export interface DashboardAttributeDisplayFormChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of parents represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

export interface DashboardAttributeDisplayFormChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED";
    readonly payload: DashboardAttributeDisplayFormChangedPayload;
}

export function attributeDisplayFormChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): DashboardAttributeDisplayFormChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

/**
 * Payload of the {@link DashboardAttributeSelectionModeChanged} event.
 *
 * @beta
 */
export interface DashboardAttributeSelectionModeChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of selection mode represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted when the attribute filter selection mode is change.
 *
 * @beta
 */
export interface DashboardAttributeSelectionModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_MODE_CHANGED";
    readonly payload: DashboardAttributeSelectionModeChangedPayload;
}

export function attributeSelectionModeChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): DashboardAttributeSelectionModeChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_MODE_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeSelectionModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterSelectionModeChanged =
    eventGuard<DashboardAttributeSelectionModeChanged>(
        "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_MODE_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link isDashboardAttributeFilterConfigModeChanged} event.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigModeChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of mode represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted when the attribute filter mode is change.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED";
    readonly payload: DashboardAttributeFilterConfigModeChangedPayload;
}

export function dashboardAttributeConfigModeChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
): DashboardAttributeFilterConfigModeChanged {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED",
        ctx,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterConfigModeChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigModeChanged =
    eventGuard<DashboardAttributeFilterConfigModeChanged>(
        "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link isDashboardAttributeFilterConfigDisplayAsLabelChanged} event.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigDisplayAsLabelChangedPayload {
    /**
     * The definition of the dashboard attribute filter.
     */
    readonly filter: IDashboardAttributeFilter;
    /**
     * New label used for displaying filter attribute values
     */
    readonly displayAsLabel: ObjRef | undefined;
}

/**
 * This event is emitted when the attribute filter mode is change.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigDisplayAsLabelChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED";
    readonly payload: DashboardAttributeFilterConfigDisplayAsLabelChangedPayload;
}

export function dashboardAttributeConfigDisplayAsLabelChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    displayAsLabel: ObjRef | undefined,
    correlationId?: string,
): DashboardAttributeFilterConfigDisplayAsLabelChanged {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
            displayAsLabel,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterConfigDisplayAsLabelChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigDisplayAsLabelChanged =
    eventGuard<DashboardAttributeFilterConfigDisplayAsLabelChanged>(
        "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link isDashboardAttributeFilterConfigLimitingItemsChanged} event.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigLimitingItemsChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of mode represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

/**
 * This event is emitted when the attribute filter limiting items are changed.
 *
 * @alpha
 */
export interface DashboardAttributeFilterConfigLimitingItemsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED";
    readonly payload: DashboardAttributeFilterConfigLimitingItemsChangedPayload;
}

export function dashboardAttributeConfigLimitingItemsChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
): DashboardAttributeFilterConfigLimitingItemsChanged {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED",
        ctx,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAttributeFilterConfigLimitingItemsChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigLimitingItemsChanged =
    eventGuard<DashboardAttributeFilterConfigLimitingItemsChanged>(
        "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED",
    );

//
//
//

/**
 * Payload of the {@link DashboardFilterContextChanged} event.
 *
 * @remarks
 *
 * See also {@link filterContextToDashboardFiltersByWidget} and {@link filterContextToDashboardFiltersByDateDataSet} convertors
 * – those allow you to convert the `filterContext` object to array of {@link @gooddata/sdk-model#IFilter} instances you can use
 * with visualizations, filter UI components and so on.
 *
 * @public
 */
export interface DashboardFilterContextChangedPayload {
    /**
     * The new value of the filterContext.
     */
    readonly filterContext: IFilterContextDefinition;
    /**
     * The new value of the attribute filter configs.
     */
    readonly attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    /**
     * The tab local identifier where the filter change was applied.
     * Only present when filters were applied to a specific tab (not the active tab).
     *
     * @internal
     */
    readonly tabLocalIdentifier?: string;
}

/**
 * This event is emitted after _any_ change to dashboard filters (be it date or attribute filter).
 * The event describes the new state of the entire filter context.
 *
 * @remarks
 * This event is emitted as convenience - more granular events describe all the possible
 * changes to the dashboard filters and can be used to event source the state of filter context.
 *
 * See also {@link filterContextToDashboardFiltersByWidget} and {@link filterContextToDashboardFiltersByDateDataSet} convertors
 * – those allow you to convert the `filterContext` in the event payload to array of {@link @gooddata/sdk-model#IFilter} instances you can use
 * with visualizations, filter UI components and so on.
 *
 * @public
 */
export interface DashboardFilterContextChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED";
    readonly payload: DashboardFilterContextChangedPayload;
}

export function filterContextChanged(
    ctx: DashboardContext,
    filterContext: IFilterContextDefinition,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    correlationId?: string,
    tabLocalIdentifier?: string,
): DashboardFilterContextChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        ctx,
        correlationId,
        payload: {
            filterContext,
            attributeFilterConfigs,
            tabLocalIdentifier,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterContextChanged}.
 *
 * @param obj - object to test
 * @public
 */
export const isDashboardFilterContextChanged = eventGuard<DashboardFilterContextChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardDateFilterTitleChanged} event.
 * @beta
 */
export interface DashboardDateTitleChangedPayload {
    /**
     * The updated definition of the dashboard date filter.
     */
    readonly filter: IDashboardDateFilter;
    readonly filterConfig: IDashboardDateFilterConfig;
}

/**
 * This event is emitted when the date filter title change.
 *
 * @beta
 */
export interface DashboardDateFilterTitleChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED";
    readonly payload: DashboardDateTitleChangedPayload;
}

export function dateFilterTitleChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter,
    filterConfig: IDashboardDateFilterConfig,
    correlationId?: string,
): DashboardDateFilterTitleChanged {
    return {
        type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
            filterConfig,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterTitleChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterTitleChanged = eventGuard<DashboardDateFilterTitleChanged>(
    "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardDateFilterModeChanged} event.
 * @beta
 */
export interface DashboardDateModeChangedPayload {
    /**
     * The updated definition of the dashboard date filter.
     */
    readonly filter: IDashboardDateFilter;
    readonly filterConfig: IDashboardDateFilterConfig;
}

/**
 * This event is emitted when the date filter title change.
 *
 * @beta
 */
export interface DashboardDateFilterModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED";
    readonly payload: DashboardDateModeChangedPayload;
}

export function dateFilterModeChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter,
    filterConfig: IDashboardDateFilterConfig,
    correlationId?: string,
): DashboardDateFilterModeChanged {
    return {
        type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
            filterConfig,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterModeChanged = eventGuard<DashboardDateFilterModeChanged>(
    "GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardDateFilterAdded} event.
 * @beta
 */
export interface DashboardDateFilterAddedPayload {
    /**
     * Definition of the created date filter. The filter's date data set ref can be used in subsequent
     * commands to identify this filter.
     */
    readonly added: IDashboardDateFilter;

    /**
     * Zero-based index indicating the position of the date filter among the other filters.
     */
    readonly index: number;
}

/**
 * This event is emitted after a new dashboard date filter is successfully
 * added into dashboard's filters.
 *
 * @beta
 */
export interface DashboardDateFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.ADDED";
    readonly payload: DashboardDateFilterAddedPayload;
}

export function dateFilterAdded(
    ctx: DashboardContext,
    added: IDashboardDateFilter,
    index: number,
    correlationId?: string,
): DashboardDateFilterAdded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.ADDED",
        ctx,
        correlationId,
        payload: {
            added,
            index,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterAdded = eventGuard<DashboardDateFilterAdded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.ADDED",
);

//
//
//

/**
 * Payload of the {@link DashboardDateFilterRemoved} event.
 * @beta
 */
export interface DashboardDateFilterRemovedPayload {
    /**
     * Definition of the removed date filter.
     */
    readonly removed: IDashboardDateFilter;
}

/**
 * This event is emitted after a dashboard date filter is successfully
 * removed from the dashboard's filters.
 *
 * @beta
 */
export interface DashboardDateFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED";
    readonly payload: DashboardDateFilterRemovedPayload;
}

export function dateFilterRemoved(
    ctx: DashboardContext,
    removed: IDashboardDateFilter,
    correlationId?: string,
): DashboardDateFilterRemoved {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED",
        ctx,
        correlationId,
        payload: {
            removed,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterRemoved = eventGuard<DashboardDateFilterRemoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardDateFilterMoved} event.
 * @beta
 */
export interface DashboardDateFilterMovedPayload {
    /**
     * Definition of the dashboard date filter that was moved.
     */
    readonly moved: IDashboardDateFilter;

    /**
     * The original position of the filter.
     */
    readonly fromIndex: number;

    /**
     * New absolute position of the filter.
     */
    readonly toIndex: number;
}

/**
 * This event is emitted after a dashboard date filter is moved from one position in the filter bar
 * to a new position
 *
 * @beta
 */
export interface DashboardDateFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED";
    readonly payload: DashboardDateFilterMovedPayload;
}

export function dateFilterMoved(
    ctx: DashboardContext,
    moved: IDashboardDateFilter,
    fromIndex: number,
    toIndex: number,
    correlationId?: string,
): DashboardDateFilterMoved {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED",
        ctx,
        correlationId,
        payload: {
            moved,
            fromIndex,
            toIndex,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardDateFilterMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterMoved = eventGuard<DashboardDateFilterMoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED",
);

/**
 * Payload of the {@link DashboardFilterViewCreationSucceeded} event.
 *
 * @alpha
 */
export interface DashboardFilterViewCreationSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a new dashboard filter view is successfully created.
 *
 * @alpha
 */
export interface DashboardFilterViewCreationSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.SUCCESS";
    readonly payload: DashboardFilterViewCreationSucceededPayload;
}

export function filterViewCreationSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): DashboardFilterViewCreationSucceeded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.SUCCESS",
        ctx,
        correlationId,
        payload: {
            filterView,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewCreationSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewCreationSucceeded = eventGuard<DashboardFilterViewCreationSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.SUCCESS",
);

/**
 * This event is emitted after a new dashboard filter view creation failed.
 *
 * @alpha
 */
export interface DashboardFilterViewCreationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE";
}

export function filterViewCreationFailed(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardFilterViewCreationFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewCreationFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewCreationFailed = eventGuard<DashboardFilterViewCreationFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE",
);

/**
 * Payload of the {@link DashboardFilterViewDeletionSucceeded} event.
 *
 * @alpha
 */
export interface DashboardFilterViewDeletionSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view is successfully deleted.
 *
 * @alpha
 */
export interface DashboardFilterViewDeletionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.SUCCESS";
    readonly payload: DashboardFilterViewDeletionSucceededPayload;
}

export function filterViewDeletionSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): DashboardFilterViewDeletionSucceeded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.SUCCESS",
        ctx,
        correlationId,
        payload: {
            filterView,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewDeletionSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewDeletionSucceeded = eventGuard<DashboardFilterViewDeletionSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.SUCCESS",
);

/**
 * This event is emitted after a dashboard filter view deletion failed.
 *
 * @alpha
 */
export interface DashboardFilterViewDeletionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE";
}

export function filterViewDeletionFailed(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardFilterViewDeletionFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewDeletionFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewDeletionFailed = eventGuard<DashboardFilterViewDeletionFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE",
);

/**
 * Payload of the {@link DashboardFilterViewApplicationSucceeded} event.
 *
 * @alpha
 */
export interface DashboardFilterViewApplicationSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view is successfully applied.
 *
 * @alpha
 */
export interface DashboardFilterViewApplicationSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS";
    readonly payload: DashboardFilterViewApplicationSucceededPayload;
}

export function filterViewApplicationSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): DashboardFilterViewApplicationSucceeded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
        ctx,
        correlationId,
        payload: {
            filterView,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewApplicationSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewApplicationSucceeded = eventGuard<DashboardFilterViewApplicationSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
);

/**
 * This event is emitted after a dashboard filter view application failed.
 *
 * @alpha
 */
export interface DashboardFilterViewApplicationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE";
}

export function filterViewApplicationFailed(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardFilterViewApplicationFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewApplicationFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewApplicationFailed = eventGuard<DashboardFilterViewApplicationFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE",
);

/**
 * Payload of the {@link DashboardFilterViewDefaultStatusChangeSucceeded} event.
 *
 * @alpha
 */
export interface DashboardFilterViewDefaultStatusChangeSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view default status is successfully changed.
 * See the enclosed filterView object in the payload to check its new status.
 *
 * @alpha
 */
export interface DashboardFilterViewDefaultStatusChangeSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.SUCCESS";
    readonly payload: DashboardFilterViewDefaultStatusChangeSucceededPayload;
}

export function filterViewDefaultStatusChangeSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): DashboardFilterViewDefaultStatusChangeSucceeded {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.SUCCESS",
        ctx,
        correlationId,
        payload: {
            filterView,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewDefaultStatusChangeSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewDefaultStatusChangeSucceeded =
    eventGuard<DashboardFilterViewDefaultStatusChangeSucceeded>(
        "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.SUCCESS",
    );

/**
 * Payload of the {@link DashboardFilterViewDefaultStatusChangeFailed} event.
 *
 * @alpha
 */
export interface DashboardFilterViewDefaultStatusChangeFailedPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view default status change failed.
 *
 * @alpha
 */
export interface DashboardFilterViewDefaultStatusChangeFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.FAILURE";
    readonly payload: DashboardFilterViewDefaultStatusChangeFailedPayload;
}

export function filterViewDefaultStatusChangeFailed(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): DashboardFilterViewDefaultStatusChangeFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.FAILURE",
        ctx,
        correlationId,
        payload: {
            filterView,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterViewDefaultStatusChangeFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewDefaultStatusChangeFailed =
    eventGuard<DashboardFilterViewDefaultStatusChangeFailed>(
        "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.FAILURE",
    );

/**
 * This event is emitted after dashboard selection filters have been reset.
 *
 * @alpha
 */
export interface DashboardFilterContextSelectionReseted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET";
}

/**
 * @alpha
 */
export function filterContextSelectionReseted(
    correlationId?: string,
): DashboardEventBody<DashboardFilterContextSelectionReseted> {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardFilterContextSelectionReseted}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterContextSelectionReseted = eventGuard<DashboardFilterContextSelectionReseted>(
    "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET",
);
