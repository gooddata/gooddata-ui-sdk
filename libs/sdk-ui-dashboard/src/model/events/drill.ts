// (C) 2021-2026 GoodData Corporation

import {
    type FilterContextItem,
    type IAttributeDescriptor,
    type ICrossFiltering,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDrillToAttributeUrl,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IDrillToLegacyDashboard,
    type IInsight,
    type IKeyDriveAnalysis,
    type IMeasureDescriptor,
} from "@gooddata/sdk-model";
import { type ExplicitDrill, type ITableDataAttributeScope } from "@gooddata/sdk-ui";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type IKdaDefinition } from "../../kdaDialog/types.js";
import {
    type IDashboardDrillContext,
    type IDashboardDrillEvent,
    type IDashboardFilter,
    type IDrillDownDefinition,
} from "../../types.js";
import { type DashboardContext, type FiltersInfo } from "../types/commonTypes.js";

/**
 * @internal
 */
export type DashboardKeyDriverCombinationRangeItem = { normalizedValue: string } & IAttributeDescriptor;

/**
 * @internal
 */
export interface IDashboardKeyDriverCombinationItem {
    where: "before" | "after" | "none";
    type: "comparative" | "year-to-year";
    measure: IMeasureDescriptor;
    difference: number;
    values: [number, number];
    range: [ITableDataAttributeScope, ITableDataAttributeScope];
}

/**
 * Payload of the {@link IDashboardDrillRequested} event.
 * @alpha
 */
export interface IDashboardDrillRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Context in which the drill interaction was triggered (widget and insight details - if available).
     */
    readonly drillContext: IDashboardDrillContext;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrill} command.
 * It contains details about all possible drill definitions that are available for this particular drill interaction
 *
 * @alpha
 */
export interface IDashboardDrillRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.REQUESTED";
    readonly payload: IDashboardDrillRequestedPayload;
}

/**
 * @alpha
 */
export function drillRequested(
    ctx: DashboardContext,
    drillEvent: IDashboardDrillEvent,
    drillContext: IDashboardDrillContext,
    correlationId?: string,
): IDashboardDrillRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillRequested = eventGuard<IDashboardDrillRequested>("GDC.DASH/EVT.DRILL.REQUESTED");

/**
 * Payload of the {@link IDashboardDrillResolved} event.
 * @alpha
 */
export interface IDashboardDrillResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Context in which the drill interaction was triggered (widget and insight details - if available).
     */
    readonly drillContext: IDashboardDrillContext;
}

/**
 * A general drill event that is emitted each time any dashboard drill is resolved.
 * It contains only valid drillDefinitions for this particular drill interaction,
 * so you can select and dispatch relevant more granular drill command(s).
 *
 * This is general dashboard drill event with details about all possible more granular drill interactions that can follow.
 * Reason for this general drill event is that it may happen that multiple drill interactions are possible for one drill event.
 *
 * Example: some attribute on the insight has drilled down set and also widget has drilled to insight set. Then this event will be dispatched with both
 * {@link @gooddata/sdk-ui-ext#IDrillDownDefinition} and {@link @gooddata/sdk-backend-spi#IDrillToInsight} definitions.
 *
 * - This must be always the first event that occurs after the drill interaction, and must be dispatched before more granular drill events.
 * - Specific drill commands that can follow this general drill event are: {@link IDrillDown}, {@link IDrillToInsight}, {@link IDrillToDashboard},
 *   {@link IDrillToCustomUrl}, {@link IDrillToAttributeUrl}, {@link IDrillToLegacyDashboard}
 *
 * @alpha
 */
export interface IDashboardDrillResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.RESOLVED";
    readonly payload: IDashboardDrillResolvedPayload;
}

/**
 * @alpha
 */
export function drillResolved(
    ctx: DashboardContext,
    drillEvent: IDashboardDrillEvent,
    drillContext: IDashboardDrillContext,
    correlationId?: string,
): IDashboardDrillResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillContext,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillResolved = eventGuard<IDashboardDrillResolved>("GDC.DASH/EVT.DRILL.RESOLVED");

//
//
//

/**
 * Payload of the {@link IDashboardDrillDownRequested} event.
 * @alpha
 */
export interface IDashboardDrillDownRequestedPayload {
    /**
     * Drill down definition that was applied.
     */
    readonly drillDefinition: IDrillDownDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * The target insight to apply drill down on.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillDown} command.
 * It contains the target insight to apply the drill-down on (result of the drill-down application
 * depends on the particular visualization type).
 *
 * @alpha
 */
export interface IDashboardDrillDownRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED";
    readonly payload: IDashboardDrillDownRequestedPayload;
}

/**
 * @alpha
 */
export function drillDownRequested(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillDownRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillDownRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillDownRequested = eventGuard<IDashboardDrillDownRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED",
);

/**
 * Payload of the {@link IDashboardDrillDownResolved} event.
 * @alpha
 */
export interface IDashboardDrillDownResolvedPayload {
    /**
     * Drill down definition that was applied.
     */
    readonly drillDefinition: IDrillDownDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Target insight with the drill-down definition applied.
     */
    readonly insight: IInsight;
}

/**
 * This event is emitted as a result of the {@link IDrillDown} command.
 * It contains the target insight with the drill-down definition applied (result of the drill-down application
 * depends on the particular visualization type).
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has this particular drill down definition applied.
 *
 * @alpha
 */
export interface IDashboardDrillDownResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED";
    readonly payload: IDashboardDrillDownResolvedPayload;
}

/**
 * @alpha
 */
export function drillDownResolved(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillDownResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillDownResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillDownResolved = eventGuard<IDashboardDrillDownResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillToInsightRequested} event.
 * @alpha
 */
export interface IDashboardDrillToInsightRequestedPayload {
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
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillToInsight} command.
 * It contains the target insight to apply drill intersection filters on.
 *
 * @alpha
 */
export interface IDashboardDrillToInsightRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED";
    readonly payload: IDashboardDrillToInsightRequestedPayload;
}

/**
 * @alpha
 */
export function drillToInsightRequested(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToInsightRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToInsightRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToInsightRequested = eventGuard<IDashboardDrillToInsightRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED",
);

/**
 * Payload of the {@link IDashboardDrillToInsightResolved} event.
 * @alpha
 */
export interface IDashboardDrillToInsightResolvedPayload {
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
}

/**
 * This event is emitted as a result of the {@link IDrillToInsight} command.
 * It contains the target insight with the drill intersection filters applied.
 *
 * In the default dashboard implementation this event also opens drill dialog with the insight
 * that has the drill intersection filters applied.
 *
 * @alpha
 */
export interface IDashboardDrillToInsightResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED";
    readonly payload: IDashboardDrillToInsightResolvedPayload;
}

/**
 * @alpha
 */
export function drillToInsightResolved(
    ctx: DashboardContext,
    insight: IInsight,
    drillDefinition: IDrillToInsight,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToInsightResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
        ctx,
        correlationId,
        payload: {
            insight,
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToInsightResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToInsightResolved = eventGuard<IDashboardDrillToInsightResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillToDashboardRequested} event.
 * @alpha
 */
export interface IDashboardDrillToDashboardRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboard;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillToDashboard} command.
 *
 * @alpha
 */
export interface IDashboardDrillToDashboardRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED";
    readonly payload: IDashboardDrillToDashboardRequestedPayload;
}

/**
 * @alpha
 */
export function drillToDashboardRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToDashboardRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToDashboardRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToDashboardRequested = eventGuard<IDashboardDrillToDashboardRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED",
);

/**
 * Payload of the {@link IDashboardDrillToDashboardResolved} event.
 * @alpha
 */
export interface IDashboardDrillToDashboardResolvedPayload {
    /**
     * Drill intersection filters that can be applied to the target dashboard.
     */
    readonly filters: (IDashboardFilter | FilterContextItem)[];

    /**
     * Attribute filter configs with additional props
     */
    readonly attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition with the target dashboard.
     */
    readonly drillDefinition: IDrillToDashboard;
}

/**
 * This event is emitted as a result of the {@link IDrillToDashboard} command.
 * It contains the drill intersection filters that can be applied to the target dashboard.
 *
 * There is a factory function to create default event handler for drill to same dashboard - see {@link newDrillToSameDashboardHandler}.
 *
 * @alpha
 */
export interface IDashboardDrillToDashboardResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED";
    readonly payload: IDashboardDrillToDashboardResolvedPayload;
}

/**
 * @alpha
 */
export function drillToDashboardResolved(
    ctx: DashboardContext,
    filters: (IDashboardFilter | FilterContextItem)[],
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    drillDefinition: IDrillToDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToDashboardResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        ctx,
        correlationId,
        payload: {
            filters,
            attributeFilterConfigs,
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToDashboardResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToDashboardResolved = eventGuard<IDashboardDrillToDashboardResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillToCustomUrlRequested} event.
 * @alpha
 */
export interface IDashboardDrillToCustomUrlRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the custom url that was resolved.
     */
    readonly drillDefinition: IDrillToCustomUrl;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillToCustomUrl} command.
 *
 * @alpha
 */
export interface IDashboardDrillToCustomUrlRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED";
    readonly payload: IDashboardDrillToCustomUrlRequestedPayload;
}

/**
 * @alpha
 */
export function drillToCustomUrlRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToCustomUrlRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToCustomUrlRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToCustomUrlRequested = eventGuard<IDashboardDrillToCustomUrlRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED",
);

/**
 * Payload of the {@link IDashboardDrillToCustomUrlResolved} event.
 * @alpha
 */
export interface IDashboardDrillToCustomUrlResolvedPayload {
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
    /**
     * Information about filters used on the dashboard.
     */
    readonly filtersInfo: FiltersInfo;
}

/**
 * This event is emitted as a result of the {@link IDrillToCustomUrl} command.
 * It contains resolved custom url from the drill definition.
 *
 * @alpha
 */
export interface IDashboardDrillToCustomUrlResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED";
    readonly payload: IDashboardDrillToCustomUrlResolvedPayload;
}

/**
 * @alpha
 */
export function drillToCustomUrlResolved(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToCustomUrl,
    drillEvent: IDashboardDrillEvent,
    filtersInfo: FiltersInfo,
    correlationId?: string,
): IDashboardDrillToCustomUrlResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            url,
            drillEvent,
            drillDefinition,
            filtersInfo,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToCustomUrlResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToCustomUrlResolved = eventGuard<IDashboardDrillToCustomUrlResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillToAttributeUrlRequested} event.
 * @alpha
 */
export interface IDashboardDrillToAttributeUrlRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the attribute url that was resolved.
     */
    readonly drillDefinition: IDrillToAttributeUrl;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillToAttributeUrl} command.
 *
 * @alpha
 */
export interface IDashboardDrillToAttributeUrlRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED";
    readonly payload: IDashboardDrillToAttributeUrlRequestedPayload;
}

/**
 * @alpha
 */
export function drillToAttributeUrlRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToAttributeUrlRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToAttributeUrlRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToAttributeUrlRequested = eventGuard<IDashboardDrillToAttributeUrlRequested>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED",
);

/**
 * Payload of the {@link IDashboardDrillToAttributeUrlResolved} event.
 * @alpha
 */
export interface IDashboardDrillToAttributeUrlResolvedPayload {
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
    /**
     * Information about filters used on the dashboard.
     */
    readonly filtersInfo: FiltersInfo;
    /**
     * drill is implicit generated on the fly base on metadata model or configured by user
     */
    readonly isImplicit: boolean;
}

/**
 * This event is emitted as a result of the {@link IDrillToAttributeUrl} command.
 * It contains resolved attribute url from the drill definition.
 *
 * @alpha
 */
export interface IDashboardDrillToAttributeUrlResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED";
    readonly payload: IDashboardDrillToAttributeUrlResolvedPayload;
}

/**
 * @alpha
 */
export function drillToAttributeUrlResolved(
    ctx: DashboardContext,
    url: string,
    drillDefinition: IDrillToAttributeUrl,
    drillEvent: IDashboardDrillEvent,
    filtersInfo: FiltersInfo,
    isImplicit: boolean,
    correlationId?: string,
): IDashboardDrillToAttributeUrlResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
            url,
            filtersInfo,
            isImplicit,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToAttributeUrlResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToAttributeUrlResolved = eventGuard<IDashboardDrillToAttributeUrlResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillToLegacyDashboardRequested} event.
 * @alpha
 */
export interface IDashboardDrillToLegacyDashboardRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the drill information.
     */
    readonly drillDefinition: IDrillToLegacyDashboard;
}

/**
 * This event is emitted on start of the resolution of the {@link IDrillToLegacyDashboard} command.
 *
 * @alpha
 */
export interface IDashboardDrillToLegacyDashboardRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED";
    readonly payload: IDashboardDrillToLegacyDashboardRequestedPayload;
}

/**
 * @alpha
 */
export function drillToLegacyDashboardRequested(
    ctx: DashboardContext,
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToLegacyDashboardRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToLegacyDashboardRequested}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToLegacyDashboardRequested =
    eventGuard<IDashboardDrillToLegacyDashboardRequested>(
        "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED",
    );

/**
 * Payload of the {@link IDashboardDrillToLegacyDashboardResolved} event.
 * @alpha
 */
export interface IDashboardDrillToLegacyDashboardResolvedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the drill information.
     */
    readonly drillDefinition: IDrillToLegacyDashboard;
}

/**
 * This event is emitted as a result of the {@link IDrillToLegacyDashboard} command.
 *
 * Drill to legacy dashboard can be configured for Kpi widgets only.
 *
 * @alpha
 */
export interface IDashboardDrillToLegacyDashboardResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED";
    readonly payload: IDashboardDrillToLegacyDashboardResolvedPayload;
}

/**
 * @alpha
 */
export function drillToLegacyDashboardResolved(
    ctx: DashboardContext,
    drillDefinition: IDrillToLegacyDashboard,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardDrillToLegacyDashboardResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillEvent,
            drillDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillToLegacyDashboardResolved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillToLegacyDashboardResolved = eventGuard<IDashboardDrillToLegacyDashboardResolved>(
    "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardDrillableItemsChanged} event.
 * @alpha
 */
export interface IDashboardDrillableItemsChangedPayload {
    /**
     * Drillable items that was set.
     */
    readonly drillableItems: ExplicitDrill[];
}

/**
 * This event is emitted as a result of the {@link IChangeDrillableItems} command, if drillable items was successfully changed.
 *
 * @alpha
 */
export interface IDashboardDrillableItemsChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED";
    readonly payload: IDashboardDrillableItemsChangedPayload;
}

/**
 * @alpha
 */
export function drillableItemsChanged(
    ctx: DashboardContext,
    drillableItems: ExplicitDrill[],
    correlationId?: string,
): IDashboardDrillableItemsChanged {
    return {
        type: "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED",
        ctx,
        correlationId,
        payload: {
            drillableItems,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardDrillableItemsChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardDrillableItemsChanged = eventGuard<IDashboardDrillableItemsChanged>(
    "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardCrossFilteringRequested} event.
 * @beta
 */
export interface IDashboardCrossFilteringRequestedPayload {
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition.
     */
    readonly drillDefinition: ICrossFiltering;
}

/**
 * This event is emitted on start of the resolution of the {@link ICrossFiltering} command.
 *
 * @beta
 */
export interface IDashboardCrossFilteringRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.REQUESTED";
    readonly payload: IDashboardCrossFilteringRequestedPayload;
}

/**
 * @beta
 */
export function crossFilteringRequested(
    ctx: DashboardContext,
    drillDefinition: ICrossFiltering,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardCrossFilteringRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardCrossFilteringRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardCrossFilteringRequested = eventGuard<IDashboardCrossFilteringRequested>(
    "GDC.DASH/EVT.DRILL.CROSS_FILTERING.REQUESTED",
);

/**
 * Payload of the {@link IDashboardCrossFilteringResolved} event.
 * @beta
 */
export interface IDashboardCrossFilteringResolvedPayload {
    /**
     * Dashboard filters from drill intersection.
     */
    readonly filters: IDashboardAttributeFilter[];
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with the custom url that was resolved.
     */
    readonly drillDefinition: ICrossFiltering;
}

/**
 * This event is emitted as a result of the {@link ICrossFiltering} command.
 *
 * @beta
 */
export interface IDashboardCrossFilteringResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED";
    readonly payload: IDashboardCrossFilteringResolvedPayload;
}

/**
 * @beta
 */
export function crossFilteringResolved(
    ctx: DashboardContext,
    filters: IDashboardAttributeFilter[],
    drillDefinition: ICrossFiltering,
    drillEvent: IDashboardDrillEvent,
    correlationId?: string,
): IDashboardCrossFilteringResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED",
        ctx,
        correlationId,
        payload: {
            filters,
            drillDefinition,
            drillEvent,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardCrossFilteringResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardCrossFilteringResolved = eventGuard<IDashboardCrossFilteringResolved>(
    "GDC.DASH/EVT.DRILL.CROSS_FILTERING.RESOLVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardKeyDriverAnalysisRequested} event.
 * @beta
 */
export interface IDashboardKeyDriverAnalysisRequestedPayload {
    /**
     * Key driver item to analyze.
     */
    readonly keyDriveItem: IDashboardKeyDriverCombinationItem;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     *  Drill definition.
     */
    readonly drillDefinition: IKeyDriveAnalysis;
}

/**
 * This event is emitted on start of the resolution of the {@link IKeyDriverAnalysis} command.
 *
 * @beta
 */
export interface IDashboardKeyDriverAnalysisRequested extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.REQUESTED";
    readonly payload: IDashboardKeyDriverAnalysisRequestedPayload;
}

/**
 * @beta
 */
export function keyDriverAnalysisRequested(
    ctx: DashboardContext,
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDashboardDrillEvent,
    keyDriveItem: IDashboardKeyDriverCombinationItem,
    correlationId?: string,
): IDashboardKeyDriverAnalysisRequested {
    return {
        type: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.REQUESTED",
        ctx,
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
            keyDriveItem,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKeyDriverAnalysisRequested}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKeyDriverAnalysisRequested = eventGuard<IDashboardKeyDriverAnalysisRequested>(
    "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.REQUESTED",
);

/**
 * This event is emitted as a result of the {@link IKeyDriverAnalysis} command.
 *
 * @beta
 */
export interface IDashboardKeyDriverAnalysisResolved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED";
    readonly payload: IDashboardKeyDriverAnalysisResolvedPayload;
}

/**
 * Payload of the {@link IDashboardKeyDriverAnalysisResolved} event.
 * @beta
 */
export interface IDashboardKeyDriverAnalysisResolvedPayload {
    /**
     * Key driver item to analyze.
     */
    readonly keyDriveDefinition: IKdaDefinition;
    /**
     * Original drill event, that triggered this particular drill interaction.
     */
    readonly drillEvent: IDashboardDrillEvent;
    /**
     * Drill definition with key driver analysis
     */
    readonly drillDefinition: IKeyDriveAnalysis;
}

/**
 * @beta
 */
export function keyDriverAnalysisResolved(
    ctx: DashboardContext,
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDashboardDrillEvent,
    keyDriveDefinition: IKdaDefinition,
    correlationId?: string,
): IDashboardKeyDriverAnalysisResolved {
    return {
        type: "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED",
        ctx,
        correlationId,
        payload: {
            drillDefinition,
            drillEvent,
            keyDriveDefinition,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardKeyDriverAnalysisResolved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardKeyDriverAnalysisResolved = eventGuard<IDashboardKeyDriverAnalysisResolved>(
    "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED",
);
