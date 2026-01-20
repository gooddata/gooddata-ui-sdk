// (C) 2021-2026 GoodData Corporation

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * This event is emitted when an attribute hierarchy is created.
 *
 * @internal
 */
export interface ICreateAttributeHierarchyRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED";
}

/**
 * Create {@link ICreateAttributeHierarchyRequested} event
 *
 * @internal
 */
export function createAttributeHierarchyRequested(
    correlationId?: string,
): DashboardEventBody<ICreateAttributeHierarchyRequested> {
    return {
        type: "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link ICreateAttributeHierarchyRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isCreateAttributeHierarchyRequested = eventGuard<ICreateAttributeHierarchyRequested>(
    "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED",
);

/**
 * This event is emitted when an attribute hierarchy is deleted.
 *
 * @internal
 */
export interface IDeleteAttributeHierarchyRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED";
}

/**
 * Create {@link IDeleteAttributeHierarchyRequested} event
 *
 * @internal
 */
export function deleteAttributeHierarchyRequested(
    correlationId?: string,
): DashboardEventBody<IDeleteAttributeHierarchyRequested> {
    return {
        type: "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDeleteAttributeHierarchyRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isDeleteAttributeHierarchyRequested = eventGuard<IDeleteAttributeHierarchyRequested>(
    "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED",
);
