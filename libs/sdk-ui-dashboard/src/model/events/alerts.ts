// (C) 2021-2025 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { DashboardContext } from "../types/commonTypes.js";
import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardAlertCreated} event.
 * @beta
 */
export interface DashboardAlertCreatedPayload {
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
export interface DashboardAlertCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.CREATED";
    readonly payload: DashboardAlertCreatedPayload;
}

export function alertCreated(
    ctx: DashboardContext,
    alert: IAutomationMetadataObject,
    correlationId?: string,
): DashboardAlertCreated {
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
 * Tests whether the provided object is an instance of {@link DashboardAlertCreated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertCreated = eventGuard<DashboardAlertCreated>("GDC.DASH/EVT.ALERT.CREATED");

/**
 * Payload of the {@link DashboardAlertCreated} event.
 * @beta
 */
export interface DashboardAlertSavedPayload {
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
export interface DashboardAlertSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.SAVED";
    readonly payload: DashboardAlertSavedPayload;
}

export function alertSaved(
    ctx: DashboardContext,
    alert: IAutomationMetadataObject,
    correlationId?: string,
): DashboardAlertSaved {
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
 * Tests whether the provided object is an instance of {@link DashboardAlertSaved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertSaved = eventGuard<DashboardAlertSaved>("GDC.DASH/EVT.ALERT.SAVED");
