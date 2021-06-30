// (C) 2021 GoodData Corporation
import { IDashboardCommand } from "./base";
import { IDashboardDrillEvent, IDrillDownDefinition } from "@gooddata/sdk-ui-ext";
import {
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
} from "@gooddata/sdk-backend-spi";
import { DashboardDrillContext } from "../../drill/interfaces";
import { IInsight } from "@gooddata/sdk-model";

/**
 * Performs drill.
 *
 * @internal
 */
export interface Drill extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL";
    readonly payload: {
        readonly drillEvent: IDashboardDrillEvent;
        readonly drillContext: DashboardDrillContext;
    };
}

/**
 * Creates the PerformDrill command.
 * Dispatching this command will result into triggering relevant drill events.
 *
 * @internal
 */
export function drill(
    drillEvent: IDashboardDrillEvent,
    drillContext: DashboardDrillContext,
    correlationId?: string,
): Drill {
    return {
        type: "GDC.DASH/CMD.DRILL",
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
 * Performs drill down.
 *
 * @internal
 */
export interface DrillDown extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_DOWN";
    readonly payload: {
        readonly insight: IInsight;
        readonly drillDefinition: IDrillDownDefinition;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillDown command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillDown(
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillDown {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_DOWN",
        correlationId,
        payload: {
            insight,
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Performs drill to insight.
 *
 * @internal
 */
export interface DrillToInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT";
    readonly payload: {
        readonly drillDefinition: IDrillToInsight;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillToInsight command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillToInsight(
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToInsight {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_INSIGHT",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Performs drill to dashboard.
 *
 * @internal
 */
export interface DrillToDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD";
    readonly payload: {
        readonly drillDefinition: IDrillToDashboard;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillToDashboard command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillToDashboard(
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToDashboard {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_DASHBOARD",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Performs drill to custom url.
 *
 * @internal
 */
export interface DrillToCustomUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL";
    readonly payload: {
        readonly drillDefinition: IDrillToCustomUrl;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillToCustomUrl command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillToCustomUrl(
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToCustomUrl {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_CUSTOM_URL",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Performs drill to attribute url.
 *
 * @internal
 */
export interface DrillToAttributeUrl extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL";
    readonly payload: {
        readonly drillDefinition: IDrillToAttributeUrl;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillToAttributeUrl command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillToAttributeUrl(
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToAttributeUrl {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_ATTRIBUTE_URL",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

//
//
//

/**
 * Performs drill to legacy dashboard.
 *
 * @internal
 */
export interface DrillToLegacyDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD";
    readonly payload: {
        readonly drillDefinition: IDrillToLegacyDashboard;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * Creates the PerformDrillToLegacyDashboard command.
 * Dispatching this command will result into loading additional data and then triggering relevant drill events.
 *
 * @internal
 */
export function drillToLegacyDashboard(
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): DrillToLegacyDashboard {
    return {
        type: "GDC.DASH/CMD.DRILL.DRILL_TO_LEGACY_DASHBOARD",
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}
