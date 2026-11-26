// (C) 2026 GoodData Corporation

import { type IInsightParameterValue, type IdentifierRef, type ObjRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../types/commonTypes.js";

import { type DashboardEventBody, type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * This event is emitted after dashboard parameter runtime values have been reset on the active tab.
 *
 * @alpha
 */
export interface IDashboardParametersSelectionReset extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET";
}

/**
 * @alpha
 */
export function parametersSelectionReset(
    correlationId?: string,
): DashboardEventBody<IDashboardParametersSelectionReset> {
    return {
        type: "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET",
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardParametersSelectionReset}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardParametersSelectionReset = eventGuard<IDashboardParametersSelectionReset>(
    "GDC.DASH/EVT.PARAMETERS.SELECTION.RESET",
);

/**
 * Payload of the {@link IDashboardParametersChanged} event.
 *
 * @alpha
 */
export interface IDashboardParametersChangedPayload {
    /**
     * Applied parameter values of the affected tab.
     */
    readonly parameters: IInsightParameterValue[];
    /**
     * Local identifier of the tab the values were applied to.
     */
    readonly tabLocalIdentifier: string;
}

/**
 * This event is emitted after dashboard parameter runtime values have changed on a tab.
 *
 * @alpha
 */
export interface IDashboardParametersChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.PARAMETERS.CHANGED";
    readonly payload: IDashboardParametersChangedPayload;
}

/**
 * @alpha
 */
export function parametersChanged(
    ctx: DashboardContext,
    parameters: IInsightParameterValue[],
    tabLocalIdentifier: string,
    correlationId?: string,
): IDashboardParametersChanged {
    return {
        type: "GDC.DASH/EVT.PARAMETERS.CHANGED",
        ctx,
        correlationId,
        payload: {
            parameters,
            tabLocalIdentifier,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardParametersChanged}.
 *
 * @param obj - object to test
 *
 * @alpha
 */
export const isDashboardParametersChanged = eventGuard<IDashboardParametersChanged>(
    "GDC.DASH/EVT.PARAMETERS.CHANGED",
);

/**
 * Payload of the {@link IDashboardParametersAdded} event.
 *
 * @internal
 */
export interface IDashboardParametersAddedPayload {
    readonly refs: IdentifierRef[];
}

/**
 * This event is emitted after workspace parameters have been added to the active tab.
 *
 * @internal
 */
export interface IDashboardParametersAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.PARAMETERS.ADDED";
    readonly payload: IDashboardParametersAddedPayload;
}

/**
 * @internal
 */
export function parametersAdded(
    ctx: DashboardContext,
    refs: IdentifierRef[],
    correlationId?: string,
): IDashboardParametersAdded {
    return {
        type: "GDC.DASH/EVT.PARAMETERS.ADDED",
        ctx,
        correlationId,
        payload: {
            refs,
        },
    };
}

/**
 * Payload of the {@link IDashboardParametersRemoved} event.
 *
 * @internal
 */
export interface IDashboardParametersRemovedPayload {
    readonly refs: ObjRef[];
}

/**
 * This event is emitted after parameters have been removed from the active tab.
 *
 * @internal
 */
export interface IDashboardParametersRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.PARAMETERS.REMOVED";
    readonly payload: IDashboardParametersRemovedPayload;
}

/**
 * @internal
 */
export function parametersRemoved(
    ctx: DashboardContext,
    refs: ObjRef[],
    correlationId?: string,
): IDashboardParametersRemoved {
    return {
        type: "GDC.DASH/EVT.PARAMETERS.REMOVED",
        ctx,
        correlationId,
        payload: {
            refs,
        },
    };
}
