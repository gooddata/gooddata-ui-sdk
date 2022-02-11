// (C) 2021-2022 GoodData Corporation
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterContextDefinition,
} from "@gooddata/sdk-backend-spi";
import { IDashboardEvent } from "./base";
import { DashboardContext } from "../types/commonTypes";
import { eventGuard } from "./util";

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
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardAttributeFilterAdded = eventGuard<DashboardAttributeFilterAdded>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterRemoved} event.
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardAttributeFilterRemoved = eventGuard<DashboardAttributeFilterRemoved>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardAttributeFilterMoved} event.
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export const isDashboardAttributeFilterParentChanged = eventGuard<DashboardAttributeFilterParentChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED",
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
}

/**
 * This event is emitted after _any_ change to dashboard filters (be it date or attribute filter).
 * The event describes the new state of the entire filter context.
 *
 * This event is emitted as convenience - more granular events describe all the possible
 * changes to the dashboard filters and can be used to event source the state of filter context.
 *
 * @remarks
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
    correlationId?: string,
): DashboardFilterContextChanged {
    return {
        type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        ctx,
        correlationId,
        payload: {
            filterContext,
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
