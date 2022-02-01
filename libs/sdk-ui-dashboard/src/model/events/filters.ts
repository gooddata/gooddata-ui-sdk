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
 * This event is emitted after the dashboard's date filter selection is changed.
 *
 * ** PAYLOAD **
 * @param filter - {@link @gooddata/sdk-backend-spi#IDashboardDateFilter} object with changed selection
 * @param dateFilterOptionLocalId - optional local identifier of the new selected date filter option
 *
 * @public
 */
export interface DashboardDateFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED";
    readonly payload: {
        readonly filter: IDashboardDateFilter | undefined;
        readonly dateFilterOptionLocalId?: string;
    };
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
 * @alpha
 */
export const isDashboardDateFilterSelectionChanged = eventGuard<DashboardDateFilterSelectionChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED",
);

//
//
//

/**
 * This event is emitted after a new dashboard attribute filter is successfully added into dashboard's
 * filters.
 *
 * Each dashboard attribute filter has
 *
 * @alpha
 */
export interface DashboardAttributeFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED";
    readonly payload: {
        /**
         * Definition of the created attribute filter. The filter's local identifier can be used in subsequent
         * commands to identify this filter.
         */
        readonly added: IDashboardAttributeFilter;

        /**
         * Zero-based index indicating the position of the attribute filter among the other filters.
         */
        readonly index: number;
    };
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
 * This event is emitted after a dashboard attribute filter is successfully removed.
 *
 * If the removed filter figured as a parent to one or more child filters, then the removal
 * also cleaned up the parent relationship.
 *
 * @alpha
 */
export interface DashboardAttributeFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED";
    readonly payload: {
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
    };
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
 * This event is emitted after a dashboard attribute filter is moved from one position in the filter bar
 * to a new position
 *
 * @alpha
 */
export interface DashboardAttributeFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED";
    readonly payload: {
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
    };
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
 * This event is emitted after new elements are selected and applied in an attribute filter.
 *
 * The filter in the payload object must be converted to a {@link @gooddata/sdk-model#IFilter} object before its usage.
 *
 * ** PAYLOAD **
 * @param filter - {@link @gooddata/sdk-backend-spi#IDashboardAttributeFilter} object with changed selection
 *
 * @public
 */
export interface DashboardAttributeFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED";
    readonly payload: {
        /**
         * The update definition of the dashboard attribute filter.
         *
         * The attribute elements and/or the negativeSelection indicator values have changed.
         */
        readonly filter: IDashboardAttributeFilter;
    };
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
 * @alpha
 */
export const isDashboardAttributeFilterSelectionChanged =
    eventGuard<DashboardAttributeFilterSelectionChanged>(
        "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
    );

//
//
//

/**
 * This event is emitted after the parent relationships of a filter change.
 *
 * @alpha
 */
export interface DashboardAttributeFilterParentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED";
    readonly payload: {
        /**
         * The updated definition of the dashboard attribute filter.
         *
         * The definition of parents represents the new state.
         */
        readonly filter: IDashboardAttributeFilter;
    };
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
 * This event is emitted after _any_ change to dashboard filters (be it date or attribute filter).
 * The event describes the new state of the entire filter context.
 *
 * This event is emitted as convenience - more granular events describe all the possible
 * changes to the dashboard filters and can be used to event source the state of filter context.
 *
 * ** PAYLOAD **
 * @param filterContext - {@link @gooddata/sdk-backend-spi#IFilterContextDefinition} object
 *
 * @public
 */
export interface DashboardFilterContextChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED";
    readonly payload: {
        readonly filterContext: IFilterContextDefinition;
    };
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
 * @alpha
 */
export const isDashboardFilterContextChanged = eventGuard<DashboardFilterContextChanged>(
    "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
);
