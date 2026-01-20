// (C) 2021-2026 GoodData Corporation

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
export type DashboardDateFilterSelectionChangedPayload = {
    /**
     * Object with changed date filter selection.
     */
    readonly filter: IDashboardDateFilter | undefined;
    /**
     * Optional local identifier of the new selected date filter option.
     */
    readonly dateFilterOptionLocalId?: string;
};

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
export type DashboardDateFilterSelectionChanged = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED";
    readonly payload: DashboardDateFilterSelectionChangedPayload;
};

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
 * Payload of the {@link IDashboardAttributeFilterAdded} event.
 * @beta
 */
export interface IDashboardAttributeFilterAddedPayload {
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
export interface IDashboardAttributeFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED";
    readonly payload: IDashboardAttributeFilterAddedPayload;
}

export function attributeFilterAdded(
    ctx: DashboardContext,
    added: IDashboardAttributeFilter,
    index: number,
    correlationId?: string,
): IDashboardAttributeFilterAdded {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterAdded = eventGuard<IDashboardAttributeFilterAdded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
);

//
//
//

/**
 * Payload of the {@link IDashboardAttributeFilterRemoved} event.
 * @beta
 */
export interface IDashboardAttributeFilterRemovedPayload {
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
export interface IDashboardAttributeFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED";
    readonly payload: IDashboardAttributeFilterRemovedPayload;
}

export function attributeFilterRemoved(
    ctx: DashboardContext,
    removed: IDashboardAttributeFilter,
    children?: IDashboardAttributeFilter[],
    correlationId?: string,
): IDashboardAttributeFilterRemoved {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterRemoved = eventGuard<IDashboardAttributeFilterRemoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardAttributeFilterMoved} event.
 * @beta
 */
export interface IDashboardAttributeFilterMovedPayload {
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
export interface IDashboardAttributeFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED";
    readonly payload: IDashboardAttributeFilterMovedPayload;
}

export function attributeFilterMoved(
    ctx: DashboardContext,
    moved: IDashboardAttributeFilter,
    fromIndex: number,
    toIndex: number,
    correlationId?: string,
): IDashboardAttributeFilterMoved {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterMoved = eventGuard<IDashboardAttributeFilterMoved>(
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
export type DashboardAttributeFilterSelectionChangedPayload = {
    /**
     * The update definition of the dashboard attribute filter.
     *
     * The attribute elements and/or the negativeSelection indicator values have changed.
     */
    readonly filter: IDashboardAttributeFilter;
};

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
export type DashboardAttributeFilterSelectionChanged = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED";
    readonly payload: DashboardAttributeFilterSelectionChangedPayload;
};

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
 * Payload of the {@link IDashboardAttributeFilterParentChanged} event.
 * @beta
 */
export interface IDashboardAttributeFilterParentChangedPayload {
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
export interface IDashboardAttributeFilterParentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED";
    readonly payload: IDashboardAttributeFilterParentChangedPayload;
}

export function attributeFilterParentChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): IDashboardAttributeFilterParentChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterParentChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterParentChanged = eventGuard<IDashboardAttributeFilterParentChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardAttributeTitleChanged} event.
 * @beta
 */
export interface IDashboardAttributeTitleChangedPayload {
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
export interface IDashboardAttributeTitleChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED";
    readonly payload: IDashboardAttributeTitleChangedPayload;
}

export function attributeDisplayTitleChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): IDashboardAttributeTitleChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeTitleChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterTitleChanged = eventGuard<IDashboardAttributeTitleChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED",
);

export interface IDashboardAttributeDisplayFormChangedPayload {
    /**
     * The updated definition of the dashboard attribute filter.
     *
     * The definition of parents represents the new state.
     */
    readonly filter: IDashboardAttributeFilter;
}

export interface IDashboardAttributeDisplayFormChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED";
    readonly payload: IDashboardAttributeDisplayFormChangedPayload;
}

export function attributeDisplayFormChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): IDashboardAttributeDisplayFormChanged {
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
 * Payload of the {@link IDashboardAttributeSelectionModeChanged} event.
 *
 * @beta
 */
export interface IDashboardAttributeSelectionModeChangedPayload {
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
export interface IDashboardAttributeSelectionModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_MODE_CHANGED";
    readonly payload: IDashboardAttributeSelectionModeChangedPayload;
}

export function attributeSelectionModeChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    correlationId?: string,
): IDashboardAttributeSelectionModeChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeSelectionModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAttributeFilterSelectionModeChanged =
    eventGuard<IDashboardAttributeSelectionModeChanged>(
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
export interface IDashboardAttributeFilterConfigModeChangedPayload {
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
export interface IDashboardAttributeFilterConfigModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED";
    readonly payload: IDashboardAttributeFilterConfigModeChangedPayload;
}

export function dashboardAttributeConfigModeChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
): IDashboardAttributeFilterConfigModeChanged {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.MODE_CHANGED",
        ctx,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterConfigModeChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigModeChanged =
    eventGuard<IDashboardAttributeFilterConfigModeChanged>(
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
export interface IDashboardAttributeFilterConfigDisplayAsLabelChangedPayload {
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
export interface IDashboardAttributeFilterConfigDisplayAsLabelChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED";
    readonly payload: IDashboardAttributeFilterConfigDisplayAsLabelChangedPayload;
}

export function dashboardAttributeConfigDisplayAsLabelChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
    displayAsLabel: ObjRef | undefined,
    correlationId?: string,
): IDashboardAttributeFilterConfigDisplayAsLabelChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterConfigDisplayAsLabelChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigDisplayAsLabelChanged =
    eventGuard<IDashboardAttributeFilterConfigDisplayAsLabelChanged>(
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
export interface IDashboardAttributeFilterConfigLimitingItemsChangedPayload {
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
export interface IDashboardAttributeFilterConfigLimitingItemsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED";
    readonly payload: IDashboardAttributeFilterConfigLimitingItemsChangedPayload;
}

export function dashboardAttributeConfigLimitingItemsChanged(
    ctx: DashboardContext,
    filter: IDashboardAttributeFilter,
): IDashboardAttributeFilterConfigLimitingItemsChanged {
    return {
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.LIMITING_ITEMS_CHANGED",
        ctx,
        payload: {
            filter,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardAttributeFilterConfigLimitingItemsChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAttributeFilterConfigLimitingItemsChanged =
    eventGuard<IDashboardAttributeFilterConfigLimitingItemsChanged>(
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
export type DashboardFilterContextChangedPayload = {
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
};

/**
 * This event is emitted after _any_ change to dashboard filters (be it date or attribute filter).
 * The event describes the new state of the entire filter context.
 *
 * @remarks
 * This event is emitted as convenience - more granular events describe all the possible
 * changes to the dashboard filters and can be used to even source the state of filter context.
 *
 * See also {@link filterContextToDashboardFiltersByWidget} and {@link filterContextToDashboardFiltersByDateDataSet} convertors
 * – those allow you to convert the `filterContext` in the event payload to array of {@link @gooddata/sdk-model#IFilter} instances you can use
 * with visualizations, filter UI components and so on.
 *
 * @public
 */
export type DashboardFilterContextChanged = IDashboardEvent & {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED";
    readonly payload: DashboardFilterContextChangedPayload;
};

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
 * Payload of the {@link IDashboardDateFilterTitleChanged} event.
 * @beta
 */
export interface IDashboardDateTitleChangedPayload {
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
export interface IDashboardDateFilterTitleChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED";
    readonly payload: IDashboardDateTitleChangedPayload;
}

export function dateFilterTitleChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter,
    filterConfig: IDashboardDateFilterConfig,
    correlationId?: string,
): IDashboardDateFilterTitleChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardDateFilterTitleChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterTitleChanged = eventGuard<IDashboardDateFilterTitleChanged>(
    "GDC.DASH/EVT.DATE_FILTER_CONFIG.TITLE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDateFilterModeChanged} event.
 * @beta
 */
export interface IDashboardDateModeChangedPayload {
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
export interface IDashboardDateFilterModeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED";
    readonly payload: IDashboardDateModeChangedPayload;
}

export function dateFilterModeChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter,
    filterConfig: IDashboardDateFilterConfig,
    correlationId?: string,
): IDashboardDateFilterModeChanged {
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
 * Tests whether the provided object is an instance of {@link IDashboardDateFilterModeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterModeChanged = eventGuard<IDashboardDateFilterModeChanged>(
    "GDC.DASH/EVT.DATE_FILTER_CONFIG.MODE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDateFilterAdded} event.
 * @beta
 */
export interface IDashboardDateFilterAddedPayload {
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
export interface IDashboardDateFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.ADDED";
    readonly payload: IDashboardDateFilterAddedPayload;
}

export function dateFilterAdded(
    ctx: DashboardContext,
    added: IDashboardDateFilter,
    index: number,
    correlationId?: string,
): IDashboardDateFilterAdded {
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
 * Tests whether the provided object is an instance of {@link IDashboardDateFilterAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterAdded = eventGuard<IDashboardDateFilterAdded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.ADDED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDateFilterRemoved} event.
 * @beta
 */
export interface IDashboardDateFilterRemovedPayload {
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
export interface IDashboardDateFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED";
    readonly payload: IDashboardDateFilterRemovedPayload;
}

export function dateFilterRemoved(
    ctx: DashboardContext,
    removed: IDashboardDateFilter,
    correlationId?: string,
): IDashboardDateFilterRemoved {
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
 * Tests whether the provided object is an instance of {@link IDashboardDateFilterRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterRemoved = eventGuard<IDashboardDateFilterRemoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.REMOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDateFilterMoved} event.
 * @beta
 */
export interface IDashboardDateFilterMovedPayload {
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
export interface IDashboardDateFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED";
    readonly payload: IDashboardDateFilterMovedPayload;
}

export function dateFilterMoved(
    ctx: DashboardContext,
    moved: IDashboardDateFilter,
    fromIndex: number,
    toIndex: number,
    correlationId?: string,
): IDashboardDateFilterMoved {
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
 * Tests whether the provided object is an instance of {@link IDashboardDateFilterMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardDateFilterMoved = eventGuard<IDashboardDateFilterMoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.MOVED",
);

/**
 * Payload of the {@link IDashboardFilterViewCreationSucceeded} event.
 *
 * @alpha
 */
export interface IDashboardFilterViewCreationSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a new dashboard filter view is successfully created.
 *
 * @alpha
 */
export interface IDashboardFilterViewCreationSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.SUCCESS";
    readonly payload: IDashboardFilterViewCreationSucceededPayload;
}

export function filterViewCreationSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): IDashboardFilterViewCreationSucceeded {
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
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewCreationSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewCreationSucceeded = eventGuard<IDashboardFilterViewCreationSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.SUCCESS",
);

/**
 * This event is emitted after a new dashboard filter view creation failed.
 *
 * @alpha
 */
export interface IDashboardFilterViewCreationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE";
}

export function filterViewCreationFailed(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardFilterViewCreationFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewCreationFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewCreationFailed = eventGuard<IDashboardFilterViewCreationFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CREATE.FAILURE",
);

/**
 * Payload of the {@link IDashboardFilterViewDeletionSucceeded} event.
 *
 * @alpha
 */
export interface IDashboardFilterViewDeletionSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view is successfully deleted.
 *
 * @alpha
 */
export interface IDashboardFilterViewDeletionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.SUCCESS";
    readonly payload: IDashboardFilterViewDeletionSucceededPayload;
}

export function filterViewDeletionSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): IDashboardFilterViewDeletionSucceeded {
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
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewDeletionSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewDeletionSucceeded = eventGuard<IDashboardFilterViewDeletionSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.SUCCESS",
);

/**
 * This event is emitted after a dashboard filter view deletion failed.
 *
 * @alpha
 */
export interface IDashboardFilterViewDeletionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE";
}

export function filterViewDeletionFailed(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardFilterViewDeletionFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewDeletionFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewDeletionFailed = eventGuard<IDashboardFilterViewDeletionFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.DELETE.FAILURE",
);

/**
 * Payload of the {@link IDashboardFilterViewApplicationSucceeded} event.
 *
 * @alpha
 */
export interface IDashboardFilterViewApplicationSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view is successfully applied.
 *
 * @alpha
 */
export interface IDashboardFilterViewApplicationSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS";
    readonly payload: IDashboardFilterViewApplicationSucceededPayload;
}

export function filterViewApplicationSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): IDashboardFilterViewApplicationSucceeded {
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
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewApplicationSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewApplicationSucceeded = eventGuard<IDashboardFilterViewApplicationSucceeded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
);

/**
 * This event is emitted after a dashboard filter view application failed.
 *
 * @alpha
 */
export interface IDashboardFilterViewApplicationFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE";
}

export function filterViewApplicationFailed(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardFilterViewApplicationFailed {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewApplicationFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewApplicationFailed = eventGuard<IDashboardFilterViewApplicationFailed>(
    "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE",
);

/**
 * Payload of the {@link IDashboardFilterViewDefaultStatusChangeSucceeded} event.
 *
 * @alpha
 */
export interface IDashboardFilterViewDefaultStatusChangeSucceededPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view default status is successfully changed.
 * See the enclosed filterView object in the payload to check its new status.
 *
 * @alpha
 */
export interface IDashboardFilterViewDefaultStatusChangeSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.SUCCESS";
    readonly payload: IDashboardFilterViewDefaultStatusChangeSucceededPayload;
}

export function filterViewDefaultStatusChangeSucceeded(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): IDashboardFilterViewDefaultStatusChangeSucceeded {
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
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewDefaultStatusChangeSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardFilterViewDefaultStatusChangeSucceeded =
    eventGuard<IDashboardFilterViewDefaultStatusChangeSucceeded>(
        "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.SUCCESS",
    );

/**
 * Payload of the {@link IDashboardFilterViewDefaultStatusChangeFailed} event.
 *
 * @alpha
 */
export interface IDashboardFilterViewDefaultStatusChangeFailedPayload {
    readonly filterView: IDashboardFilterView;
}

/**
 * This event is emitted after a dashboard filter view default status change failed.
 *
 * @alpha
 */
export interface IDashboardFilterViewDefaultStatusChangeFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.FAILURE";
    readonly payload: IDashboardFilterViewDefaultStatusChangeFailedPayload;
}

export function filterViewDefaultStatusChangeFailed(
    ctx: DashboardContext,
    filterView: IDashboardFilterView,
    correlationId?: string,
): IDashboardFilterViewDefaultStatusChangeFailed {
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
 * Tests whether the provided object is an instance of {@link IDashboardFilterViewDefaultStatusChangeFailed}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterViewDefaultStatusChangeFailed =
    eventGuard<IDashboardFilterViewDefaultStatusChangeFailed>(
        "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS.FAILURE",
    );

/**
 * This event is emitted after dashboard selection filters have been reset.
 *
 * @alpha
 */
export interface IDashboardFilterContextSelectionReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET";
}

/**
 * @alpha
 */
export function filterContextSelectionReset(
    correlationId?: string,
): DashboardEventBody<IDashboardFilterContextSelectionReset> {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardFilterContextSelectionReset}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardFilterContextSelectionReset = eventGuard<IDashboardFilterContextSelectionReset>(
    "GDC.DASH/EVT.FILTER_CONTEXT.SELECTION.RESET",
);
