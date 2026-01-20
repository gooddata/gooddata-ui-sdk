// (C) 2021-2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardAlertCreated} event.
 * @beta
 */
export interface IDashboardAlertCreatedPayload {
    /**
     * The alert created.
     */
    readonly alert: IAutomationMetadataObject;
}

/**
 * This event is emitted after the alert is successfully saved.
 *
 * @beta
 */
export interface IDashboardAlertCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.CREATED";
    readonly payload: IDashboardAlertCreatedPayload;
}

export function alertCreated(
    ctx: DashboardContext,
    alert: IAutomationMetadataObject,
    correlationId?: string,
): IDashboardAlertCreated {
    return {
        type: "GDC.DASH/EVT.ALERT.CREATED",
        ctx,
        correlationId,
        payload: {
            alert,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardAlertCreated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertCreated = eventGuard<IDashboardAlertCreated>("GDC.DASH/EVT.ALERT.CREATED");

/**
 * Payload of the {@link IDashboardAlertCreated} event.
 * @beta
 */
export interface IDashboardAlertSavedPayload {
    /**
     * The alert saved.
     */
    readonly alert: IAutomationMetadataObject;
}

/**
 * This event is emitted after the alert is saved.
 *
 * @beta
 */
export interface IDashboardAlertSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.SAVED";
    readonly payload: IDashboardAlertSavedPayload;
}

export function alertSaved(
    ctx: DashboardContext,
    alert: IAutomationMetadataObject,
    correlationId?: string,
): IDashboardAlertSaved {
    return {
        type: "GDC.DASH/EVT.ALERT.SAVED",
        ctx,
        correlationId,
        payload: {
            alert,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardAlertSaved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertSaved = eventGuard<IDashboardAlertSaved>("GDC.DASH/EVT.ALERT.SAVED");
