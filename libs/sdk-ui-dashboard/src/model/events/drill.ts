// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";
import { IInsight } from "@gooddata/sdk-model";
import {
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToAttributeUrl,
    IDrillToCustomUrl,
    IDrillToLegacyDashboard,
} from "@gooddata/sdk-backend-spi";
import {
    IDashboardDrillEvent,
    IDrillDownDefinition,
    IDashboardFilter,
    DashboardDrillContext,
} from "../../types";

/**
 * A general drill event that is emitted each time any dashboard drill is triggered.
 * It contains details about all possible drill definitions that are available for this particular drill interaction,
 * so you can select and dispatch relevant more granular drill command(s).
 *
 * This is general dashboard drill event with details about all possible more granular drill interactions that can follow.
 * Reason for this general drill event is that it may happen that multiple drill interactions are possible for one drill event.
 *
 * Example: some attribute on the insight has drill down set and also widget has drill to insight set. Then this event will be dispatched with both
 * {@link @gooddata/sdk-ui-ext#IDrillDownDefinition} and {@link @gooddata/sdk-backend-spi#IDrillToInsight} definitions.
 *
 * - This must be always the first event that occurs after the drill interaction, and must be dispatched before more granular drill events.
 * - Specific drill commands that can follow this general drill event are: {@link DrillDown}, {@link DrillToInsight}, {@link DrillToDashboard},
 *   {@link DrillToCustomUrl}, {@link DrillToAttributeUrl}, {@link DrillToLegacyDashboard}
 *
 * @alpha
 */
export interface DashboardDrillTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.TRIGGERED";
    readonly payload: {
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         * Context in which the drill interaction was triggered (widget and insight details - if available).
         */
        readonly drillContext: DashboardDrillContext;
    };
}

/**
 * @alpha
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
 * This event is emitted as a result of the {@link DrillDown} command.
 * It contains the target insight with the drill down definition applied (result of the drill down application
 * depends on the particular visualization type).
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has this particular drill down definition applied.
 *
 * @alpha
 */
export interface DashboardDrillDownTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.TRIGGERED";
    readonly payload: {
        /**
         * Drill down definition that was applied.
         */
        readonly drillDefinition: IDrillDownDefinition;
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         * Target insight with the drill down definition applied.
         */
        readonly insight: IInsight;
    };
}

/**
 * @alpha
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
 * This event is emitted as a result of the {@link DrillToInsight} command.
 * It contains the target insight with the drill intersection filters applied.
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has the drill intersection filters applied.
 *
 * @alpha
 */
export interface DashboardDrillToInsightTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.TRIGGERED";
    readonly payload: {
        /**
         * Drill definition with the target insight.
         */
        readonly drillDefinition: IDrillToInsight;
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         * Target insight with the drill intersection filters applied.
         */
        readonly insight: IInsight;
    };
}

/**
 * @alpha
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
 * This event is emitted as a result of the {@link DrillToDashboard} command.
 * It contains the drill intersection filters that can be applied to the target dashboard.
 *
 * There is a factory function to create default event handler for drill to same dashboard - see {@link newDrillToSameDashboardHandler}.
 *
 * @alpha
 */
export interface DashboardDrillToDashboardTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.TRIGGERED";
    readonly payload: {
        /**
         * Drill intersection filters that can be applied to the target dashboard.
         */
        readonly filters: IDashboardFilter[];
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         *  Drill definition with the target dashboard.
         */
        readonly drillDefinition: IDrillToDashboard;
    };
}

/**
 * @alpha
 */
export function drillToDashboardTriggered(
    ctx: DashboardContext,
    filters: IDashboardFilter[],
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
 * This event is emitted as a result of the {@link DrillToCustomUrl} command.
 * It contains resolved custom url from the drill definition.
 *
 * @alpha
 */
export interface DashboardDrillToCustomUrlTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.TRIGGERED";
    readonly payload: {
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         * Drill definition with the custom url that was resolved.
         */
        readonly drillDefinition: IDrillToCustomUrl;
        /**
         * Resolved custom url.
         */
        readonly url: string;
    };
}

/**
 * @alpha
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
 * This event is emitted as a result of the {@link DrillToAttributeUrl} command.
 * It contains resolved attribute url from the drill definition.
 *
 * @alpha
 */
export interface DashboardDrillToAttributeUrlTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.TRIGGERED";
    readonly payload: {
        /**
         * Original drill event, that triggered this particular drill interaction.
         */
        readonly drillEvent: IDashboardDrillEvent;
        /**
         * Drill definition with the attribute url that was resolved.
         */
        readonly drillDefinition: IDrillToAttributeUrl;
        /**
         * Resolved attribute url.
         */
        readonly url: string;
    };
}

/**
 * @alpha
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
 * This event is emitted as a result of the {@link DrillToLegacyDashboard} command.
 *
 * Drill to legacy dashboard can be configured for Kpi widgets only.
 *
 * @alpha
 */
export interface DashboardDrillToLegacyDashboardTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.TRIGGERED";
    readonly payload: {
        readonly drillDefinition: IDrillToLegacyDashboard;
        readonly drillEvent: IDashboardDrillEvent;
    };
}

/**
 * @alpha
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
