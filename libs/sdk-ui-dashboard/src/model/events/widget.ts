// (C) 2021 GoodData Corporation

import { IExecutionDefinition, ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { DashboardEventBody, IDashboardEvent } from "./base";
import { eventGuard } from "./util";

/**
 * This event is emitted after execution of an insight widget starts.
 *
 * @alpha
 */
export interface DashboardWidgetExecutionStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED";
    readonly payload: {
        widgetRef: ObjRef;
        executionDefinition: IExecutionDefinition;
    };
}

/**
 * @alpha
 */
export function widgetExecutionStarted(
    widgetRef: ObjRef,
    executionDefinition: IExecutionDefinition,
    correlationId?: string,
): DashboardEventBody<DashboardWidgetExecutionStarted> {
    return {
        type: "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED",
        correlationId,
        payload: {
            widgetRef,
            executionDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardWidgetExecutionStarted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardWidgetExecutionStarted = eventGuard<DashboardWidgetExecutionStarted>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED",
);

/**
 * This event is emitted after execution of an insight widget fails.
 *
 * @alpha
 */
export interface DashboardWidgetExecutionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED";
    readonly payload: {
        error: GoodDataSdkError;
        widgetRef: ObjRef;
    };
}

/**
 * @alpha
 */
export function widgetExecutionFailed(
    widgetRef: ObjRef,
    error: GoodDataSdkError,
    correlationId?: string,
): DashboardEventBody<DashboardWidgetExecutionFailed> {
    return {
        type: "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED",
        correlationId,
        payload: {
            widgetRef,
            error,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardWidgetExecutionFailed}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardWidgetExecutionFailed = eventGuard<DashboardWidgetExecutionFailed>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED",
);

/**
 * This event is emitted after execution of an insight widget succeeds.
 *
 * @alpha
 */
export interface DashboardWidgetExecutionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED";
    readonly payload: {
        widgetRef: ObjRef;
    };
}

/**
 * @alpha
 */
export function widgetExecutionSucceeded(
    widgetRef: ObjRef,
    correlationId?: string,
): DashboardEventBody<DashboardWidgetExecutionSucceeded> {
    return {
        type: "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED",
        correlationId,
        payload: {
            widgetRef,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardWidgetExecutionSucceeded}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardWidgetExecutionSucceeded = eventGuard<DashboardWidgetExecutionSucceeded>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED",
);
