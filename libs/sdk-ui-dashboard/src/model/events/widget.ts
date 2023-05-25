// (C) 2021-2023 GoodData Corporation

import { IExecutionDefinition, ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IDataView } from "@gooddata/sdk-backend-spi";

import { DashboardEventBody, IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardWidgetExecutionStarted} event.
 * @beta
 */
export interface DashboardWidgetExecutionStartedPayload {
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
export interface DashboardWidgetExecutionStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED";
    readonly payload: DashboardWidgetExecutionStartedPayload;
}

/**
 * @beta
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
 * @beta
 */
export const isDashboardWidgetExecutionStarted = eventGuard<DashboardWidgetExecutionStarted>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED",
);

//
//
//

/**
 * Payload of the {@link DashboardWidgetExecutionFailed} event.
 * @beta
 */
export interface DashboardWidgetExecutionFailedPayload {
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
export interface DashboardWidgetExecutionFailed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED";
    readonly payload: DashboardWidgetExecutionFailedPayload;
}

/**
 * @beta
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
 * @beta
 */
export const isDashboardWidgetExecutionFailed = eventGuard<DashboardWidgetExecutionFailed>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED",
);

//
//
//

/**
 * Payload of the {@link DashboardWidgetExecutionSucceeded} event.
 * @beta
 */
export interface DashboardWidgetExecutionSucceededPayload {
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
export interface DashboardWidgetExecutionSucceeded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED";
    readonly payload: DashboardWidgetExecutionSucceededPayload;
}

/**
 * @beta
 */
export function widgetExecutionSucceeded(
    widgetRef: ObjRef,
    dataView: IDataView,
    correlationId?: string,
): DashboardEventBody<DashboardWidgetExecutionSucceeded> {
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
 * Tests whether the provided object is an instance of {@link DashboardWidgetExecutionSucceeded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardWidgetExecutionSucceeded = eventGuard<DashboardWidgetExecutionSucceeded>(
    "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED",
);
