// (C) 2021 GoodData Corporation
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterContextDefinition,
} from "@gooddata/sdk-backend-spi";
import { IDashboardEvent } from "./base";
import { DashboardContext } from "../types/commonTypes";

/**
 * This event is emitted after the dashboard's date filter selection is changed.
 *
 * @internal
 */
export interface DashboardDateFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DATE_FILTER.SELECTION_CHANGED";
    readonly payload: {
        readonly filter: IDashboardDateFilter;
    };
}

export function dateFilterChanged(
    ctx: DashboardContext,
    filter: IDashboardDateFilter,
    correlationId?: string,
): DashboardDateFilterSelectionChanged {
    return {
        type: "GDC.DASH/EVT.DATE_FILTER.SELECTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

//
//
//

/**
 * This event is emitted after a new dashboard attribute filter is successfully added into dashboard's
 * filters.
 *
 * Each dashboard attribute filter has
 *
 * @internal
 */
export interface DashboardAttributeFilterAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.ADDED";
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
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.ADDED",
        ctx,
        correlationId,
        payload: {
            added,
            index,
        },
    };
}

//
//
//

/**
 * This event is emitted after a dashboard attribute filter is successfully removed.
 *
 * If the removed filter figured as a parent to one or more child filters, then the removal
 * also cleaned up the parent relationship.
 *
 * @internal
 */
export interface DashboardAttributeFilterRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.REMOVED";
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
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.REMOVED",
        ctx,
        correlationId,
        payload: {
            removed,
            children,
        },
    };
}

//
//
//

/**
 * This event is emitted after a dashboard attribute filter is moved from one position in the filter bar
 * to a new position
 *
 * @internal
 */
export interface DashboardAttributeFilterMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.MOVED";
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
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.MOVED",
        ctx,
        correlationId,
        payload: {
            moved,
            fromIndex,
            toIndex,
        },
    };
}

//
//
//

/**
 * This event is emitted after new elements are selected and applied in an attribute filter.
 *
 * @internal
 */
export interface DashboardAttributeFilterSelectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.SELECTION_CHANGED";
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
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.SELECTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

//
//
//

/**
 * This event is emitted after the parent relationships of a filter change.
 *
 * @internal
 */
export interface DashboardAttributeFilterParentChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.PARENT_CHANGED";
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
        type: "GDC.DASH/EVT.ATTRIBUTE_FILTER.PARENT_CHANGED",
        ctx,
        correlationId,
        payload: {
            filter,
        },
    };
}

//
//
//

/**
 * This event is emitted after _any_ change to dashboard filters (be it date or attribute filter).
 * The event describes the new state of the entire filter context.
 *
 * This is event is emitted as convenience - more granular events describe all the possible
 * changes to the dashboard filters and can be used to event source the state of filter context.
 *
 * @internal
 */
export interface DashboardFilterContextChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED";
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
        type: "GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED",
        ctx,
        correlationId,
        payload: {
            filterContext,
        },
    };
}
