// (C) 2021-2023 GoodData Corporation

import { DashboardEventBody, IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * This event is emitted when an attribute hierarchy is created.
 *
 * @internal
 */
export interface CreateAttributeHierarchyRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED";
}

/**
 * Create {@link CreateAttributeHierarchyRequested} event
 *
 * @internal
 */
export function createAttributeHierarchyRequested(
    correlationId?: string,
): DashboardEventBody<CreateAttributeHierarchyRequested> {
    return {
        type: "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link CreateAttributeHierarchyRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isCreateAttributeHierarchyRequested = eventGuard<CreateAttributeHierarchyRequested>(
    "GDC.DASH/EVT.CREATE_ATTRIBUTE_HIERARCHY_REQUESTED",
);

/**
 * This event is emitted when an attribute hierarchy is deleted.
 *
 * @internal
 */
export interface DeleteAttributeHierarchyRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED";
}

/**
 * Create {@link DeleteAttributeHierarchyRequested} event
 *
 * @internal
 */
export function deleteAttributeHierarchyRequested(
    correlationId?: string,
): DashboardEventBody<DeleteAttributeHierarchyRequested> {
    return {
        type: "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DeleteAttributeHierarchyRequested}.
 *
 * @param obj - object to test
 * @internal
 */
export const isDeleteAttributeHierarchyRequested = eventGuard<DeleteAttributeHierarchyRequested>(
    "GDC.DASH/EVT.DELETE_ATTRIBUTE_HIERARCHY_REQUESTED",
);
