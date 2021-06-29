// (C) 2021 GoodData Corporation
import { IDashboardDrillEvent, IDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";
import { IFilter, IInsight } from "@gooddata/sdk-model";
import { DashboardDrillContext } from "../../drill/interfaces";
import {
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToLegacyDashboard,
} from "@gooddata/sdk-backend-spi";

/**
 * This event is emitted after the drill is triggered.
 *
 * @internal
 */
export interface DashboardDrillTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.TRIGGERED";
    readonly payload: {
        readonly drillEvent: IDashboardDrillEvent;
        readonly drillContext: DashboardDrillContext;
    };
}

/**
 * @internal
 */
export function drillTriggered(
    ctx: DashboardContext,
    drillEvent: IDashboardDrillEvent,
    drillContext: DashboardDrillContext,
    correlationId?: string,
): DashboardDrillTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill down is triggered.
 *
 * @internal
 */
export interface DashboardDrillDownTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.TRIGGERED";
    readonly payload: {
        readonly drillDefinition: IDrillDownDefinition;
        readonly drillEvent: IDashboardDrillEvent;
        readonly insight: IInsight;
    };
}

/**
 * @internal
 */
export function drillDownTriggered(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillDownTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill to insight is triggered.
 *
 * @internal
 */
export interface DashboardDrillToInsightTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.TRIGGERED";
    readonly payload: {
        readonly drillDefinition: IDrillToInsight;
        readonly drillEvent: IDashboardDrillEvent;
        readonly insight: IInsight;
    };
}

/**
 * @internal
 */
export function drillToInsightTriggered(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToInsightTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill to dashboard is triggered.
 *
 * @internal
 */
export interface DashboardDrillToDashboardTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED";
    readonly payload: {
        readonly filters: IFilter[];
        readonly drillEvent: IDashboardDrillEvent;
        readonly drillDefinition: IDrillToDashboard;
    };
}

/**
 * @internal
 */
export function drillToDashboardTriggered(
    ctx: DashboardContext,
    filters: IFilter[],
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToDashboardTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            filters,
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill to attribute url is triggered.
 *
 * @internal
 */
export interface DashboardDrillToAttributeUrlTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.TRIGGERED";
    readonly payload: {
        readonly drillEvent: IDashboardDrillEvent;
        readonly drillDefinition: IDrillToAttributeUrl;
        readonly url: string;
    };
}

/**
 * @internal
 */
export function drillToAttributeUrlTriggered(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToAttributeUrlTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
            url,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill to custom url is triggered.
 *
 * @internal
 */
export interface DashboardDrillToCustomUrlTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.TRIGGERED";
    readonly payload: {
        readonly drillEvent: IDashboardDrillEvent;
        readonly drillDefinition: IDrillToCustomUrl;
        readonly url: string;
    };
}

/**
 * @internal
 */
export function drillToCustomUrlTriggered(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToCustomUrlTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            url,
            drillEvent,
            drillDefinition,
        },
    };
}

//
//
//

/**
 * This event is emitted after the drill to legacy dashboard is triggered.
 *
 * @internal
 */
export interface DashboardDrillToLegacyDashboardTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.TRIGGERED";
    readonly payload: {
        readonly drillDefinition: IDrillToLegacyDashboard;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * @internal
 */
export function drillToLegacyDashboardTriggered(
    ctx: DashboardContext,
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DashboardDrillToLegacyDashboardTriggered {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.TRIGGERED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

//
//
//
