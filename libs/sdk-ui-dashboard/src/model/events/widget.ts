// (C) 2021-2026 GoodData Corporation

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type IExecutionDefinition, type ObjRef } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link IDashboardWidgetExecutionStarted} event.
 * @beta
 */
export interface IDashboardWidgetExecutionStartedPayload {
    /**
     * Reference to the widget that this event relates to.
     */
    widgetRef: ObjRef;
    /**
     * Instance of {@link @gooddata/sdk-model#IExecutionDefinition} that the widget executed.
     */
    executionDefinition: IExecutionDefinition;
}

/**
 * This event is emitted after execution of an insight widget starts.
 *
 * @beta
 */
export interface IDashboardWidgetExecutionStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED";
    readonly payload: IDashboardWidgetExecutionStartedPayload;
}

/**
 * @beta
 */
export function widgetExecutionStarted(
    widgetRef: ObjRef,
    executionDefinition: IExecutionDefinition,
    correlationId?: string,
): DashboardEventBody<IDashboardWidgetExecutionStarted> {
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
 * Tests whether the provided object is an instance of {@link IDashboardWidgetExecutionStarted}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardWidgetExecutionStarted = eventGuard<IDashboardWidgetExecutionStarted>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED",
);

//
//
//

/**
 * Payload of the {@link IDashboardWidgetExecutionFailed} event.
 * @beta
 */
export interface IDashboardWidgetExecutionFailedPayload {
    /**
     * Instance of {@link @gooddata/sdk-ui#GoodDataSdkError} with the information about the error the related execution failed with.
     */
    error: GoodDataSdkError;
    /**
     * Reference to the widget that this event relates to.
     */
    widgetRef: ObjRef;
}

/**
 * This event is emitted after execution of an insight widget fails.
 *
 * @beta
 */
export interface IDashboardWidgetExecutionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED";
    readonly payload: IDashboardWidgetExecutionFailedPayload;
}

/**
 * @beta
 */
export function widgetExecutionFailed(
    widgetRef: ObjRef,
    error: GoodDataSdkError,
    correlationId?: string,
): DashboardEventBody<IDashboardWidgetExecutionFailed> {
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
 * Tests whether the provided object is an instance of {@link IDashboardWidgetExecutionFailed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardWidgetExecutionFailed = eventGuard<IDashboardWidgetExecutionFailed>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED",
);

//
//
//

/**
 * Payload of the {@link IDashboardWidgetExecutionSucceeded} event.
 * @beta
 */
export interface IDashboardWidgetExecutionSucceededPayload {
    /**
     * Instance of {@link @gooddata/sdk-backend-spi#IDataView} with the data the widget first requested.
     */
    dataView: IDataView;
    /**
     * Reference to the widget that this event relates to.
     */
    widgetRef: ObjRef;
}

/**
 * This event is emitted after execution of an insight widget succeeds.
 *
 * @beta
 */
export interface IDashboardWidgetExecutionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED";
    readonly payload: IDashboardWidgetExecutionSucceededPayload;
}

/**
 * @beta
 */
export function widgetExecutionSucceeded(
    widgetRef: ObjRef,
    dataView: IDataView,
    correlationId?: string,
): DashboardEventBody<IDashboardWidgetExecutionSucceeded> {
    return {
        type: "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED",
        correlationId,
        payload: {
            dataView,
            widgetRef,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardWidgetExecutionSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardWidgetExecutionSucceeded = eventGuard<IDashboardWidgetExecutionSucceeded>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED",
);
